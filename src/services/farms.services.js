const Farms = require('../models/farms.models')
const uploadImage = require('../utils/uploadImage.utils')

class FarmService {
    static addFarm = async (image, { name, email, phone, link, info }) => {
        try {
            const isExist = await Farms.findOne({ name }).lean();
            if (isExist) {
                return {
                    success: false,
                    message: "Already exist"
                }
            }

            const cloudinaryFolder = 'Fudee/Farm';
            const Image = await uploadImage(image, cloudinaryFolder);

            const newFarm = new Farms({
                name, image: Image, email, phone, link, info
            })
            return await newFarm.save()
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static getFarm = async () => {
        try {
            return await Farms.find().populate('items')
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static getFarmID = async ({ id }) => {
        try {
            const existFarm = await Farms.findById(id);
            if (!existFarm){
                return {
                    success: false,
                    message: "Don't exist"
                }
            }

            return existFarm
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static updateFarm = async ({ id }, { name, email, phone, link, info }) => {
        try {
            const existFarm = await Farms.findByIdAndUpdate(id, { name, email, phone, link, info }, {new: true})
            if (!existFarm){
                return {
                    success: false,
                    message: "Don't exist"
                }
            }

            return existFarm
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static deleteFarm = async ({ id }) => {
        try {
            const existFarm = await Farms.findByIdAndDelete(id);
            if (!existFarm){
                return {
                    success: false,
                    message: "Don't exist"
                }
            }

            return {
                success: true,
                message: "Delete successfully"
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }
}

module.exports = FarmService