export const backButtonMiddleware = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    if (typeof data === 'string' && data.includes('</head>')) {
      // Get the return URL from sessionStorage or use default
      const injectedScript = `
        <script>
          document.addEventListener('DOMContentLoaded', () => {
            const returnUrl = sessionStorage.getItem('adminReturnUrl') || window.location.origin;

            // Create back button container
            const container = document.createElement('div');
            container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000;';

            // Create back button
            const backBtn = document.createElement('button');
            backBtn.innerHTML = '← Back to App';
            backBtn.style.cssText = 'background: #4f46e5; color: white; padding: 10px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; transition: background 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.1);';

            backBtn.onmouseover = () => backBtn.style.background = '#4338ca';
            backBtn.onmouseout = () => backBtn.style.background = '#4f46e5';

            backBtn.onclick = () => {
              sessionStorage.removeItem('adminReturnUrl');
              window.history.back();
            };

            container.appendChild(backBtn);
            document.body.appendChild(container);
          });
        </script>
      `;

      const modifiedData = data.replace('</head>', injectedScript + '</head>');
      return originalSend.call(this, modifiedData);
    }

    return originalSend.call(this, data);
  };

  next();
};
