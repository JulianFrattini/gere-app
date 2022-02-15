exports.getVersion =  async(req, res, next) => {
    try{
        res.json({
            "version": "v1.0.0"
        })
    } catch(error) {
        next(error)
    }
}