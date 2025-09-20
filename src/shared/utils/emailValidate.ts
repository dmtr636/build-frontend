const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const emailValidate = (email: string) => {
    return emailRegex.test(email);
};
