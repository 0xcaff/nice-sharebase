// Sets any calls to date to return a constant time with a lot of zeros.
const constantDate = new Date(1500000000000);

global.Date.now = () => constantDate;