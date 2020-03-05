
const ENTITY_TYPES = {
        BOX:                    0,
        CIRCLE:                 1,
        TREE:                   3,

        classNames: [
                'box',
                'circle',
                'tree'
        ]
};

if (typeof window === 'undefined') {
        module.exports = ENTITY_TYPES
}
