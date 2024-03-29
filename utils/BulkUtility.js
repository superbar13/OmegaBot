module.exports = {
    name: 'bulkutility',
    incrementAllFieldsValue: (filter, update, arrayFilters) => {
        return {
            updateMany: {
                filter: filter,
                update: {
                    $inc: update
                },
                arrayFilters: arrayFilters
            }
        }
    },

    incrementField: (filter, update) => {
        return {
            updateMany: {
                filter: filter,
                update: {
                    $inc: update
                }
            }
        }
    },

    setAllObjectInArray: (filter, update, arrayFilters) => {
        return {
            updateMany: {
                filter: filter,
                update: {
                    $set: update
                },
                arrayFilters: arrayFilters
            }
        }
    },

    setField: (filter, update) => {
        return {
            updateMany: {
                filter: filter,
                update: {
                    $set: update
                }
            }
        }
    },

    unsetField: (filter, update) => {
        return {
            updateMany: {
                filter: filter,
                update: {
                    $unset: update
                }
            }
        }
    },

    pullInArray: (filter, update) => {
        return {
            updateMany: {
                filter: filter,
                update: {
                    $pull: update
                }
            }
        }
    },

    pushInArray: (filter, update) => {
        return {
            updateMany: {
                filter: filter,
                update: {
                    $push: update
                }
            }
        }
    },

    editInArray: (filter, update, arrayFilters) => {
        return {
            updateMany: {
                filter: filter,
                update: {
                    $set: update
                },
                arrayFilters: arrayFilters
            }
        }
    },
    
    deleteAllDocuments: (filter) => {
        return {
            deleteMany: {
                filter: filter
            }
        }
    }
}