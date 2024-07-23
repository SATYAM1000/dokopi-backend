import axios from 'axios';
import { Router } from 'express'

const locationRouter = Router()

locationRouter.get('/location', async (req, res) => {
    const { SeachLocation } = req.query;
    try {
        if (!SeachLocation || SeachLocation.length < 2) {
            return res.json({
                msg: "Seach Parameter should be given",
                success: false
            })
        }
        const { data } =
            await axios.get(`https://api.locationiq.com/v1/search?key=${process.env.LOCATION_FROM_NAME_TO_COORDINATES}&q=${SeachLocation}&countrycodes=IN&format=json`)

        return res.json({ result: data, success: true })
    } catch (error) {
        return res.json({
            msg: "Something went wrong",
            success: false,
            error
        })
    }
})

export default locationRouter