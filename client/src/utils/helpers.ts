import { formatDistanceToNow, format } from "date-fns";
import { zhCN } from "date-fns/locale";

export const formatDate = (date: string | Date) => {
  return format(new Date(date), "yyyy年MM月dd日", { locale: zhCN });
};

export const formatDateTime = (date: string | Date) => {
  return format(new Date(date), "yyyy年MM月dd日 HH:mm", { locale: zhCN });
};

export const formatRelativeTime = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: zhCN,
  });
};

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export const stripHtmlTags = (html: string) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};
