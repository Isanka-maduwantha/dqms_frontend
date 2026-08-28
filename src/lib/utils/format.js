export function formatCurrency(amount) {
    const value = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
    return `Rs. ${value.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
export function formatDate(value) {
    if (!value)
        return "—";
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime()))
        return String(value);
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}
export function formatDateTime(value) {
    if (!value)
        return "—";
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime()))
        return String(value);
    return `${formatDate(date)} • ${date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    })}`;
}
export function todayISODate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
export function titleCase(value) {
    if (!value)
        return "";
    return value
        .toLowerCase()
        .split(/[_\s]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
