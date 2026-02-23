export const formatTime = (timeString: string | Date) => {
  if (!timeString) return "-";
  const str = String(timeString);
  if (str.includes("T")) {
    return str.substring(11, 16);
  }
  return str;
};
