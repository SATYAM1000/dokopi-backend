const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const validateDate = (date) => {
    if (dateRegex.test(date)) {
        return true;
    }
    return false;
};