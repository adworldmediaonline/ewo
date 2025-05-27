import { toast, Zoom } from 'react-toastify';

const notifySuccess = message =>
  toast.success(message, {
    position: 'top-center',

    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    transition: Zoom,
    className: 'custom-toast-center',
    onOpen: () => {
      // Force center positioning when toast opens
      setTimeout(() => {
        const containers = document.querySelectorAll(
          '[class*="Toastify__toast-container"]'
        );
        containers.forEach(container => {
          if (container) {
            container.style.setProperty('position', 'fixed', 'important');
            container.style.setProperty('top', '50%', 'important');
            container.style.setProperty('left', '50%', 'important');
            container.style.setProperty(
              'transform',
              'translate(-50%, -50%)',
              'important'
            );
          }
        });
      }, 0);
    },
  });

const notifyError = message =>
  toast.error(message, {
    position: 'top-center',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    transition: Zoom,
    className: 'custom-toast-center',
    onOpen: () => {
      // Force center positioning when toast opens
      setTimeout(() => {
        const containers = document.querySelectorAll(
          '[class*="Toastify__toast-container"]'
        );
        containers.forEach(container => {
          if (container) {
            container.style.setProperty('position', 'fixed', 'important');
            container.style.setProperty('top', '50%', 'important');
            container.style.setProperty('left', '50%', 'important');
            container.style.setProperty(
              'transform',
              'translate(-50%, -50%)',
              'important'
            );
          }
        });
      }, 0);
    },
  });

export { notifySuccess, notifyError };
