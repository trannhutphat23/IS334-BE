const FarmService = require('../services/farms.services')

class FarmController {
    addFarm = async (req, res, next) => {
        try {
            return res.status(201).json(await FarmService.addFarm(req.file.path, req.body))
        } catch (error) {
            next(error)
        }
    }

    getFarm = async (req, res, next) => {
        try {
            return res.status(201).json(await FarmService.getFarm())
        } catch (error) {
            next(error)
        }
    }

    getFarmID = async (req, res, next) => {
        try {
            return res.status(201).json(await FarmService.getFarmID(req.params))
        } catch (error) {
            next(error)
        }
    }

    updateFarm = async (req, res, next) => {
        try {
            return res.status(201).json(await FarmService.updateFarm(req.params, req.body))
        } catch (error) {
            next(error)
        }
    }

    deleteFarm = async (req, res, next) => {
        try {
            console.log(req.params)
            return res.status(201).json(await FarmService.deleteFarm(req.params))
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new FarmController()
