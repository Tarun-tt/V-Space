const showToast = ({
  message,
  type = "info",
  title = "",
  autoClose = 5000,
}) => {
  if (typeof window !== "undefined" && window.Liferay?.Util?.openToast) {
    window.Liferay.Util.openToast({
      message,
      type: type === "danger" ? "danger" : type,
      title,
      autoClose,
    });
  } else {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("app:toast", {
        detail: { message, type, title },
      });
      window.dispatchEvent(event);
    }
    console.log(`[Toast ${type}] ${title ? title + ": " : ""}${message}`);
  }
};

export default showToast;
