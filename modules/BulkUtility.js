module.exports = {
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
    
    deleteAllDocuments: (filter) => {
        return {
            deleteMany: {
                filter: filter
            }
        }
    }
}