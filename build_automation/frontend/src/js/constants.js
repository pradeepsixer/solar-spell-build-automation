const __DIRLAYOUT_SAVE_TYPE = {
    CREATE: 'create',
    UPDATE: 'update',
    CLONE: 'clone'
};

const __HTTP_STATUS = {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
};

const __TAG_SAVE_TYPE = {
    CREATE: 'create',
    UPDATE: 'update'
};

const DIRLAYOUT_SAVE_TYPE = Object.freeze(__DIRLAYOUT_SAVE_TYPE);
const HTTP_STATUS = Object.freeze(__HTTP_STATUS);
const TAG_SAVE_TYPE = Object.freeze(__TAG_SAVE_TYPE);

export {
    DIRLAYOUT_SAVE_TYPE,
    HTTP_STATUS,
    TAG_SAVE_TYPE,
}
