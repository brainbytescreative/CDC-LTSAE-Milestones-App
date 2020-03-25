// ChildrenMilestones

// language=SQLite
export const Version = `
    create table IF NOT EXISTS Version
    (
        number INTEGER
    )
`;

// language=SQLite
export const ChildrenMilestones = `
    CREATE TABLE IF NOT EXISTS ChildrenMilestones
    (
        id                INTEGER PRIMARY KEY AUTOINCREMENT,
        checklistComplete BOOLEAN,
        concernsComplete  BOOLEAN,
        tipsComplete      BOOLEAN,
        quickviewComplete BOOLEAN,
        childId           INTEGER REFERENCES Children (id) ON DELETE CASCADE ON UPDATE CASCADE,
        ageId             INTEGER REFERENCES Ages (id) ON DELETE CASCADE ON UPDATE CASCADE
    );
`;

// language=SQLite
export const ConcernAnswers = `
    CREATE TABLE IF NOT EXISTS ConcernAnswers
    (
        id            INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE NOT NULL,
        concernId     INTEGER REFERENCES concern (_id) ON DELETE CASCADE ON UPDATE CASCADE,
        concernAnswer BOOLEAN,
        noteId        INTEGER REFERENCES Notes (id) ON DELETE SET NULL ON UPDATE CASCADE,
        childId       INTEGER REFERENCES Children (id) ON DELETE CASCADE ON UPDATE CASCADE
    );`;

// language=SQLite
export const Concerns = `
    CREATE TABLE IF NOT EXISTS Concerns
    (
        id          INTEGER PRIMARY KEY UNIQUE NOT NULL,
        ageId       INTEGER REFERENCES Ages (id) ON DELETE CASCADE ON UPDATE CASCADE,
        concernText TEXT
    );

`;

// language=SQLite
export const HelpfulHints = `
    CREATE TABLE IF NOT EXISTS HelpfulHints
    (
        id        INTEGER PRIMARY KEY UNIQUE NOT NULL,
        ageId     INTEGER REFERENCES Ages (id) ON DELETE CASCADE ON UPDATE CASCADE,
        imagePath TEXT,
        content   TEXT
    );

`;

// language=SQLite
export const HintsStatus = `
    CREATE TABLE IF NOT EXISTS HintsStatus
    (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        hintId  INTEGER REFERENCES HelpfulHints (id) ON DELETE CASCADE ON UPDATE CASCADE,
        childId INTEGER REFERENCES Children (id) ON DELETE CASCADE ON UPDATE CASCADE,
        showed  BOOLEAN
    );

`;

// language=SQLite
export const MilestonesAnswers = `
    CREATE TABLE IF NOT EXISTS MilestonesAnswers
    (
        id         INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE                             NOT NULL,
        childId    INTEGER REFERENCES Children (id) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
        questionId INTEGER REFERENCES MilestonesQuestions (id) ON DELETE CASCADE ON UPDATE CASCADE,
        answer     INTEGER,
        noteId     INTEGER REFERENCES Notes (id) ON DELETE SET NULL ON UPDATE CASCADE
    );

`;

// language=SQLite
export const MilestonesCategories = `
    CREATE TABLE IF NOT EXISTS MilestonesCategories
    (
        id           INTEGER PRIMARY KEY
            UNIQUE
                          NOT NULL,
        categoryName TEXT NOT NULL
    );
`;

// language=SQLite
export const MilestonesQuestions = `
    CREATE TABLE IF NOT EXISTS MilestonesQuestions
    (
        id         INTEGER                                                                          NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
        questionId INTEGER                                                                          NOT NULL,
        categoryId INTEGER REFERENCES MilestonesCategories (id) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
        ageId      INTEGER REFERENCES Ages (id) ON DELETE CASCADE ON UPDATE CASCADE,
        urgent     BOOLEAN,
        content    TEXT
    );
`;

// language=SQLite
export const Notes = `
    CREATE TABLE IF NOT EXISTS Notes
    (
        id          INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE NOT NULL,
        profileId   INTEGER REFERENCES Children (id) ON DELETE CASCADE ON UPDATE CASCADE,
        ageId       INTEGER REFERENCES Ages (id) ON DELETE CASCADE ON UPDATE CASCADE,
        noteContent TEXT
    );
`;
// language=SQLite
export const Notifications = `
    CREATE TABLE IF NOT EXISTS Notifications
    (
        notificationId           TEXT PRIMARY KEY UNIQUE NOT NULL,
        fireDateTimestamp        DATETIME,
        notificationRead         BOOLEAN,
        notificationTitle        TEXT,
        notificationBody         TEXT,
        notificationCategory     TEXT,
        notificationCategoryType INTEGER,
        childId                  INTEGER,
        ageId                    INTEGER,
        appointmentId            INTEGER,
        bodyArguments            TEXT,
        bodyLocalizedKey         TEXT,
        titleLocalizedKey        TEXT
    );
`;

// language=SQLite
export const QuestionMaterials = `
    CREATE TABLE IF NOT EXISTS QuestionMaterials
    (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        name         TEXT,
        materialType INTEGER,
        questionId   INTEGER REFERENCES MilestonesQuestions (id) ON DELETE CASCADE ON UPDATE CASCADE,
        materialAlt  TEXT
    );
`;
