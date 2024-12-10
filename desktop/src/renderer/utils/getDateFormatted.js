function getDateFormatted(date) {
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    return new Intl.DateTimeFormat('ar-EG', options).format(new Date(date));
}

function getFullDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Intl.DateTimeFormat('ar-EG', options).format(new Date(date));
}

export { getDateFormatted, getFullDate };