const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export const formatDate = (isoDate: string) => DATE_FORMAT.format(new Date(isoDate))
