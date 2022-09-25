import express, { Request, Response, Router } from "express"
import statusCodes from "../statusCodes/statusCodes"
import { AppDataSource } from "../dataSource"
import { Admin, User } from "../models/users"
import getCustomUser from "../utils/customUser"


const router: Router = express.Router()
router.route("").get(async (req: Request, res: Response) => {
    try {
        const adminRepository = AppDataSource.getRepository(Admin)
        const admins = await adminRepository.find(
            {
                relations: {
                    user: true
                }
            }
        )
        res.status(statusCodes.HTTP_200_OK).json(admins)
    }
    catch (err) {
        console.log(err)
        res.status(statusCodes.HTTP_500_INTERNAL_SERVER_ERROR).json({ err: err })
    }
}
)
router.post("/create/:userId", async (req: Request, res: Response) => {
    const { userId } = req.params
    const { isAdmin } = req.body
    // const user: User | null = getCustomUser(req)
    const adminRepository = AppDataSource.getRepository(Admin)
    try {
        if (req.session.user) {
            const adminExists = await adminRepository.findOne({
                where: {
                    user: req.session.user
                }
            })
            if (!adminExists) {
                const admin = new Admin()
                admin.user = req.session.user
                admin.isAdmin = isAdmin
                adminRepository.save(admin)
                res.status(statusCodes.HTTP_200_OK).json(
                    admin
                )
            }
            else {
                res.status(statusCodes.HTTP_400_BAD_REQUEST).json({ msg: "user already exists" })
            }

        }
        else {
            res.status(statusCodes.HTTP_404_NOT_FOUND).json({ msg: `user with id ${userId} doesnt exist` })
        }
    }
    catch (err) {
        res.status(statusCodes.HTTP_500_INTERNAL_SERVER_ERROR).json({ err: err })

    }

})
export { router as adminRoutes }