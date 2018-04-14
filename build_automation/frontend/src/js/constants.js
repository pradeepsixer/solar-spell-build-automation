const __DIRLAYOUT_SAVE_TYPE = {
    CREATE: 'create',
    UPDATE: 'update',
    CLONE: 'clone'
}

const __TAG_SAVE_TYPE = {
    CREATE: 'create',
    UPDATE: 'update'
}


const DIRLAYOUT_SAVE_TYPE = Object.freeze(__DIRLAYOUT_SAVE_TYPE);
const TAG_SAVE_TYPE = Object.freeze(__TAG_SAVE_TYPE);

module.exports = {
    DIRLAYOUT_SAVE_TYPE,
    TAG_SAVE_TYPE
}
