
export const generateReceipt = (userId) => {
    const prefix = (process.env.RECEIPT_PREFIX || "rcpt").slice(0, 10); 
    const truncatedUserId = userId.slice(-10); 
    const timestamp = new Date().getTime().toString().slice(-10); 
    return `${prefix}-${truncatedUserId}-${timestamp}`;
  };