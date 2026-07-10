// ScaleUp Chennai Academy Website Utilities Helper Library

/**
 * Escapes HTML characters in string to prevent XSS attacks.
 * @param {string} str - Raw input string.
 * @returns {string} Sanitized string.
 */
export function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Displays a non-blocking toast notification.
 * @param {string} message - Message text to display.
 * @param {string} type - 'success', 'error', 'info', or 'warning'.
 */
export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Choose icons based on type
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `
    <span>${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Fade out and remove toast after 4 seconds
  setTimeout(() => {
    toast.style.transition = 'opacity 0.5s ease';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        container.removeChild(toast);
      }
    }, 500);
  }, 4000);
}

/**
 * Format registration numbers from YYMM#### to human readable structure if needed.
 */
export function formatRegNumber(num) {
  if (!num) return '';
  const numStr = num.toString();
  if (numStr.length === 8) {
    return `SUC-${numStr.substring(0, 4)}-${numStr.substring(4)}`;
  }
  return numStr;
}

/**
 * Saves form state automatically to localStorage
 * @param {string} key - Unique key for the form
 * @param {Object} data - Form key-value pairs
 */
export function saveFormProgress(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Loads form state from localStorage
 * @param {string} key - Unique key for the form
 * @returns {Object|null}
 */
export function loadFormProgress(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Clears form state from localStorage
 * @param {string} key - Unique key
 */
export function clearFormProgress(key) {
  localStorage.removeItem(key);
}

/**
 * Generates and triggers Print/PDF download of the Registration Slip
 * @param {Object} data - The registration record details
 */
export function printRegistrationSlip(data) {
  const printWindow = window.open('', '_blank');
  
  const slipHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Registration Slip - ${data.registrationNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@700;800&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          background: #ffffff;
          color: #071b35;
          margin: 0;
          padding: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .slip-card {
          width: 100%;
          max-width: 600px;
          border: 2px solid #00d4ff;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0, 212, 255, 0.1);
          position: relative;
          background-image: radial-gradient(circle at 100% 0%, #f0fdfa 0%, transparent 40%);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          color: #071b35;
        }
        .logo span {
          color: #00d4ff;
        }
        .badge {
          background: #10b981;
          color: white;
          padding: 6px 12px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
        }
        .title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #071b35;
          margin-bottom: 20px;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .detail-item {
          display: flex;
          flex-direction: column;
        }
        .label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 4px;
          font-weight: 600;
        }
        .value {
          font-size: 0.95rem;
          font-weight: 600;
          color: #071b35;
        }
        .full-width {
          grid-column: span 2;
        }
        .footer {
          margin-top: 40px;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
          text-align: center;
          font-size: 0.75rem;
          color: #94a3b8;
          line-height: 1.5;
        }
        .btn-print {
          margin-top: 20px;
          padding: 10px 20px;
          background: #071b35;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.2s;
        }
        .btn-print:hover {
          background: #00d4ff;
        }
        @media print {
          .btn-print {
            display: none;
          }
          body {
            padding: 0;
            background: none;
          }
          .slip-card {
            border: none;
            box-shadow: none;
            max-width: 100%;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="slip-card">
        <div class="header">
          <div class="logo">ScaleUp <span>Chennai</span></div>
          <div class="badge">Active</div>
        </div>
        <div class="title">Digital Marketing Training - Registration Slip</div>
        <div class="details-grid">
          <div class="detail-item">
            <span class="label">Registration ID</span>
            <span class="value" style="color: #ff8a00; font-size: 1.1rem;">${data.registrationNumber}</span>
          </div>
          <div class="detail-item">
            <span class="label">Date Generated</span>
            <span class="value">${new Date(data.createdAt?.seconds ? data.createdAt.seconds * 1000 : Date.now()).toLocaleDateString('en-IN')}</span>
          </div>
          <div class="detail-item full-width">
            <span class="label">Full Name</span>
            <span class="value">${data.fullName}</span>
          </div>
          <div class="detail-item">
            <span class="label">Mobile Number</span>
            <span class="value">${data.mobile}</span>
          </div>
          <div class="detail-item">
            <span class="label">Email Address</span>
            <span class="value">${data.email}</span>
          </div>
          <div class="detail-item">
            <span class="label">Training Preference</span>
            <span class="value">${data.trainingMode} (${data.language})</span>
          </div>
          <div class="detail-item">
            <span class="label">Current Status</span>
            <span class="value">${data.status}</span>
          </div>
        </div>
        <div class="footer">
          Thank you for registering with ScaleUp Chennai Digital Marketing Academy.<br>
          For queries, email: support@scaleupchennai.in | Call: +91 98765 43210
        </div>
        <center><button class="btn-print" onclick="window.print()">Print Slip</button></center>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(slipHtml);
  printWindow.document.close();
}
