import { Router, type IRouter } from "express";
import healthRouter from "./health";
import eventsRouter from "./events";
import bookingsRouter from "./bookings";
import privateInquiriesRouter from "./privateInquiries";
import galleryRouter from "./gallery";
import postsRouter from "./posts";
import newsletterRouter from "./newsletter";
import storageRouter from "./storage";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(eventsRouter);
router.use(bookingsRouter);
router.use(privateInquiriesRouter);
router.use(galleryRouter);
router.use(postsRouter);
router.use(newsletterRouter);
router.use(storageRouter);
router.use(adminRouter);

export default router;
