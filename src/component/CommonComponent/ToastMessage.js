/* global Liferay */
const showToast = ({
  message,
  type = "info",
  title = "",
  autoClose = 5000,
}) => {
  if (window.Liferay?.Util?.openToast) {
    Liferay.Util.openToast({
      message,
      type,
      title,
      autoClose,
    });
  } else {
    alert(`${title ? title + ": " : ""}${message}`);
  }
};

export default showToast;
