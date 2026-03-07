"use client";

import { useReducer, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, type OcrRecord } from "@/lib/api";
import { revalidateDashboard } from "@/lib/actions";
import { resizeImage } from "@/lib/resize-image";

// ─── State & Actions ───
type Step = "upload" | "review" | "info";

interface OcrFormState {
  step: Step;
  imagePreview: string | null;
  extracting: boolean;
  records: OcrRecord[];
  title: string;
  type: string;
  date: string;
  submitting: boolean;
}

type OcrFormAction =
  | { type: "SET_STEP"; payload: Step }
  | { type: "SET_IMAGE_PREVIEW"; payload: string }
  | { type: "SET_EXTRACTING"; payload: boolean }
  | { type: "SET_RECORDS"; payload: OcrRecord[] }
  | { type: "UPDATE_RECORD"; payload: { index: number; field: keyof OcrRecord; value: string | number } }
  | { type: "REMOVE_RECORD"; payload: number }
  | { type: "ADD_RECORD" }
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_TYPE"; payload: string }
  | { type: "SET_DATE"; payload: string }
  | { type: "SET_SUBMITTING"; payload: boolean };

const initialState: OcrFormState = {
  step: "upload",
  imagePreview: null,
  extracting: false,
  records: [],
  title: "",
  type: "",
  date: "",
  submitting: false,
};

const ocrFormReducer = (state: OcrFormState, action: OcrFormAction): OcrFormState => {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "SET_IMAGE_PREVIEW":
      return { ...state, imagePreview: action.payload };
    case "SET_EXTRACTING":
      return { ...state, extracting: action.payload };
    case "SET_RECORDS":
      return { ...state, records: action.payload };
    case "UPDATE_RECORD":
      return {
        ...state,
        records: state.records.map((r, i) =>
          i === action.payload.index
            ? { ...r, [action.payload.field]: action.payload.value }
            : r
        ),
      };
    case "REMOVE_RECORD":
      return { ...state, records: state.records.filter((_, i) => i !== action.payload) };
    case "ADD_RECORD":
      return { ...state, records: [...state.records, { name: "", amount: 0 }] };
    case "SET_TITLE":
      return { ...state, title: action.payload };
    case "SET_TYPE":
      return { ...state, type: action.payload };
    case "SET_DATE":
      return { ...state, date: action.payload };
    case "SET_SUBMITTING":
      return { ...state, submitting: action.payload };
    default:
      return action satisfies never;
  }
};

// ─── Hook ───
export const useOcrEventForm = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, dispatch] = useReducer(ocrFormReducer, initialState);

  const setStep = useCallback((step: Step) => {
    dispatch({ type: "SET_STEP", payload: step });
  }, []);

  const goToPrevStep = useCallback(() => {
    dispatch({
      type: "SET_STEP",
      payload: state.step === "info" ? "review" : "upload",
    });
  }, [state.step]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다");
      return;
    }

    dispatch({ type: "SET_EXTRACTING", payload: true });
    try {
      const resizedBase64 = await resizeImage(file);
      dispatch({ type: "SET_IMAGE_PREVIEW", payload: resizedBase64 });

      const base64Data = resizedBase64.split(",")[1];
      const result = await api.ocr.extract(base64Data);

      if (result.records.length === 0) {
        toast.error("명부를 인식할 수 없습니다. 다른 이미지를 시도해주세요.");
        dispatch({ type: "SET_EXTRACTING", payload: false });
        return;
      }

      dispatch({ type: "SET_RECORDS", payload: result.records });
      dispatch({ type: "SET_STEP", payload: "review" });
      toast.success(`${result.records.length}건의 기록을 인식했습니다`);
    } catch {
      toast.error("OCR 처리 중 오류가 발생했습니다");
    } finally {
      dispatch({ type: "SET_EXTRACTING", payload: false });
    }
  }, []);

  const updateRecord = useCallback(
    (index: number, field: keyof OcrRecord, value: string | number) => {
      dispatch({ type: "UPDATE_RECORD", payload: { index, field, value } });
    },
    []
  );

  const removeRecord = useCallback((index: number) => {
    dispatch({ type: "REMOVE_RECORD", payload: index });
  }, []);

  const addRecord = useCallback(() => {
    dispatch({ type: "ADD_RECORD" });
  }, []);

  const setTitle = useCallback((value: string) => {
    dispatch({ type: "SET_TITLE", payload: value });
  }, []);

  const setType = useCallback((value: string) => {
    dispatch({ type: "SET_TYPE", payload: value });
  }, []);

  const setDate = useCallback((value: string) => {
    dispatch({ type: "SET_DATE", payload: value });
  }, []);

  const validRecords = state.records.filter((r) => r.name && r.amount > 0);
  const totalAmount = state.records.reduce((sum, r) => sum + (r.amount || 0), 0);
  const canSubmit = Boolean(state.title && state.type && state.date && validRecords.length > 0);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    dispatch({ type: "SET_SUBMITTING", payload: true });
    try {
      const result = await api.events.ocrBulk({
        title: state.title,
        type: state.type,
        date: state.date,
        records: validRecords,
      });
      await revalidateDashboard();
      toast.success(
        `이벤트가 등록되었습니다! (${result.summary.totalRecords}건, ${result.summary.totalAmount.toLocaleString()}원)`
      );
      router.push("/dashboard");
    } catch {
      toast.error("등록에 실패했습니다");
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  }, [canSubmit, state.title, state.type, state.date, validRecords, router]);

  return {
    ...state,
    fileInputRef,
    validRecords,
    totalAmount,
    canSubmit,
    setStep,
    goToPrevStep,
    handleFileSelect,
    updateRecord,
    removeRecord,
    addRecord,
    setTitle,
    setType,
    setDate,
    handleSubmit,
  };
};

export type OcrEventFormReturn = ReturnType<typeof useOcrEventForm>;
