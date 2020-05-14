export namespace Globalization {

    export enum DayOfWeek {
        sunday,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday
    }

    export enum ClockIdentifiers {
        twelveHour,
        twentyFourHour
    }

    export enum LanguageLayoutDirection {
        ltr,
        rtl,
        ttbLtr,
        ttbRtl,
    }
    export namespace NumberFormatting {
        export enum CurrencyFormatterMode {
            useSymbol,
            useCurrencyCode,
        }
        export enum RoundingAlgorithm {
            none,
            roundDown,
            roundUp,
            roundTowardsZero,
            roundAwayFromZero,
            roundHalfDown,
            roundHalfUp,
            roundHalfTowardsZero,
            roundHalfAwayFromZero,
            roundHalfToEven,
            roundHalfToOdd,
        }
    }
    export namespace PhoneNumberFormatting {
        export enum PhoneNumberFormat {
            e164,
            international,
            national,
            rfc3966,
        }
        export enum PhoneNumberMatchResult {
            noMatch,
            shortNationalSignificantNumberMatch,
            nationalSignificantNumberMatch,
            exactMatch,
        }
        export enum PhoneNumberParseResult {
            valid,
            notANumber,
            invalidCountryCode,
            tooShort,
            tooLong,
        }
        export enum PredictedPhoneNumberKind {
            fixedLine,
            mobile,
            fixedLineOrMobile,
            tollFree,
            premiumRate,
            sharedCost,
            voip,
            personalNumber,
            pager,
            universalAccountNumber,
            voicemail,
            unknown,
        }
    }

    export namespace DateTimeFormatting {

        export enum DayFormat {
            none,
            default,
        }
        export enum DayOfWeekFormat {
            none,
            default,
            abbreviated,
            full,
        }
        export enum HourFormat {
            none,
            default,
        }
        export enum MinuteFormat {
            none,
            default,
        }
        export enum MonthFormat {
            none,
            default,
            abbreviated,
            full,
            numeric,
        }
        export enum SecondFormat {
            none,
            default,
        }
        export enum YearFormat {
            none,
            default,
            abbreviated,
            full,
        }

        export class DateTimeFormatter {
            private static DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            private static SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
            private static MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            private static SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            // hardcoded en_GB >:3
            private static KNWON_FORMATS_TABLE = {
                "year": (d: Date) => {
                    return `${d.getFullYear()}`
                },
                "year.full": (d: Date) => {
                    return `${d.getFullYear()}`
                },
                "month.abbreviated": (d: Date) => {
                    return `${DateTimeFormatter.SHORT_MONTHS[d.getMonth()]}`
                },
                "hour": (d: Date) => {
                    return `${d.getHours()}`
                },
                "hour minute": (d: Date) => {
                    return `${d.getHours()} ${d.getMinutes()}`
                },
                "month year": (d: Date) => {
                    return `${DateTimeFormatter.MONTHS[d.getMonth()]} ${d.getFullYear()}`
                },
                "month day year": (d: Date) => {
                    return `${d.getDate()} ${DateTimeFormatter.MONTHS[d.getMonth()]} ${d.getFullYear()}`
                },
                "day month.full year": (d: Date) =>  {
                    return `${d.getDate()} ${DateTimeFormatter.MONTHS[d.getMonth()]} ${d.getFullYear()}`
                },
                "{dayofweek.full}": (d: Date) => {
                    return DateTimeFormatter.DAYS[d.getDay()];
                },
                "dayofweek.full": (d: Date) => {
                    return DateTimeFormatter.DAYS[d.getDay()];
                },
                "{dayofweek.abbreviated(3)}": (d: Date) => {
                    return DateTimeFormatter.SHORT_DAYS[d.getDay()];
                },
                "shortdate": (d: Date) => {
                    return `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`
                },
                "longdate": (d: Date) => {
                    return `${d.getDate()} ${DateTimeFormatter.MONTHS[d.getMonth()]} ${d.getFullYear()}`
                },
                "{dayofweek.abbreviated(2)}, {month.integer}/{day.integer}": (d: Date) => {
                    return `${DateTimeFormatter.SHORT_DAYS[d.getDay()]}. ${d.getMonth()}/${d.getDay()}`
                },
                "month.abbreviated year": (d: Date) => {
                    return `${DateTimeFormatter.SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`
                },
                "{dayofweek.full} {day.integer}": (d: Date) => {
                    return `${DateTimeFormatter.DAYS[d.getDay()]} ${d.getDate()}`
                },
                "dayofweek.abbreviated month.abbreviated day": (d: Date) => {
                    return `${DateTimeFormatter.SHORT_DAYS[d.getDay()]} ${d.getDate()} ${DateTimeFormatter.SHORT_MONTHS[d.getMonth()]}`
                },
                "dayofweek month day": (d: Date) => {
                    return `${DateTimeFormatter.DAYS[d.getDay()]} ${d.getDate()} ${DateTimeFormatter.MONTHS[d.getMonth()]}`
                },
                "dayofweek month day year": (d: Date) => {
                    return `${DateTimeFormatter.DAYS[d.getDay()]} ${d.getDate()} ${DateTimeFormatter.MONTHS[d.getMonth()]} ${d.getFullYear()}`
                },
                "{hour.integer(2)}‎:‎{minute.integer(2)}": (d: Date) => {
                    return `${d.getHours()} ${d.getMinutes()}`
                },
                "": (d: Date) => {
                    return d.toString();
                }
            }

            resolvedLanguage: string = "en-GB";
            pattern: string;
            formatter: Function;

            constructor(pattern: string) {
                this.pattern = pattern;
                if (Object.keys(DateTimeFormatter.KNWON_FORMATS_TABLE).includes(pattern)) {
                    console.info("new dtf: " + pattern);
                    this.formatter = DateTimeFormatter.KNWON_FORMATS_TABLE[pattern];
                }
                else {
                    console.warn("unknown dtf: " + pattern);
                }
            }

            public get patterns(): string[] {
                if (this.pattern === "hour minute")
                    return ["{hour.integer(2)}‎:‎{minute.integer(2)}"];

                return [this.pattern];
            }

            public static get shortDate(): DateTimeFormatter {
                return new DateTimeFormatter("shortdate");
            }

            public static get shortTime(): DateTimeFormatter {
                return new DateTimeFormatter("hour minute");
            }

            public static get longDate(): DateTimeFormatter {
                return new DateTimeFormatter("longdate");
            }

            public format(d: Date) {
                let str = this.formatter(d);
                console.log("dtf result: " + str)
                return str;
            }

        }
    }

    export namespace Collation {
        export class CharacterGrouping {
            first: string;
            end: string;
            label: string;

            constructor(char: string) {
                this.first = char;
                this.end = char;
                this.label = char.toUpperCase();
            }
        }

        export class CharacterGroupings extends Array {
            constructor() {
                super();
                let str = "abcdefghijklmnopqrstuvwxyz";
                for (var i = 0; i < str.length; i++) {
                    this.push(new CharacterGrouping(str.charAt(i)));
                }
            }
        }
    }

    export class ApplicationLanguages {
        public static languages: string[] = ["en-GB"];
    }

    export class Calendar {
        private date: Date;

        constructor(languages: string[]) {
            this.date = new Date(Date.now());
        }

        get dayOfWeek() {
            return this.date.getDay();
        }

        get day() {
            return this.date.getDate();
        }

        set day(num: number) {
            this.date.setDate(num);
        }

        get month() {
            return this.date.getMonth();
        }

        set month(num: number) {
            this.date.setMonth(num);
        }

        get year() {
            return this.date.getFullYear();
        }

        set year(num: number) {
            this.date.setFullYear(num);
        }

        get hour() {
            return this.date.getHours();
        }

        set hour(num: number) {
            this.date.setHours(num);
        }

        get minute() {
            return this.date.getMinutes();
        }

        set minute(num: number) {
            this.date.setMinutes(num);
        }

        get second() {
            return this.date.getSeconds();
        }

        set second(num: number) {
            this.date.setSeconds(num);
        }

        get nanosecond() {
            return this.date.getMilliseconds() * 1000;
        }

        set nanosecond(num: number) {
            this.date.setMilliseconds(num / 1000);
        }

        addDays(days: number) {
            this.date.setDate(this.date.getDate() + days);
        }

        addMonths(months: number) {
            this.date.setMonth(this.date.getMonth() + months);
        }

        addYears(years: number) {
            this.date.setFullYear(this.date.getFullYear() + years);
        }

        addHours(hours: number) {
            this.date.setHours(this.date.getHours() + hours);
        }

        addMinutes(minutes: number) {
            this.date.setMinutes(this.date.getMinutes() + minutes);
        }
        
        addSeconds(seconds: number) {
            this.date.setSeconds(this.date.getSeconds() + seconds);
        }

        setToMin() {
            this.date = new Date(-8640000000000000 / 2);
        }

        setToMax() {
            this.date = new Date(8640000000000000 / 2);
        }

        getDateTime() {
            return this.date;
        }

        setDateTime(date: Date) {
            this.date = date;
        }
    }
}
