
const { differenceInCalendarDays,addDays } = require('date-fns');
const catchAsyncErrors = require('../../config/catchAsyncErrors');
const Event = require('../../models/event/event.model');
const attendanceModel = require('../../models/attendance/attendance.model');
exports.changeEventsStatus=catchAsyncErrors(
    async(req,res,next)=>{
        try {
            const today = new Date();
            const date=today.getFullYear()+"-"+((today.getMonth()+1)>9?(today.getMonth()+1):"0"+(today.getMonth()+1))+"-"+((today.getDate())>9?(today.getDate()+1):"0"+(today.getDate()));
            const todaysDate=new Date(date)
            // Update events whose start date is greater than or equal to today's date
            await Event.updateMany({ eventStartDate: { $lte: todaysDate } }, { $set: { eventStatus: 'started' } });
        } catch (error) {
            console.log(error);
        }
    }
)
exports.changeEventToEnd = catchAsyncErrors(async (req, res, next) => {
    try {
        const today = new Date();
        const date = today.getFullYear() + "-" + ((today.getMonth() + 1) > 9 ? (today.getMonth() + 1) : "0" + (today.getMonth() + 1)) + "-" + ((today.getDate()) > 9 ? (today.getDate() + 1) : "0" + (today.getDate()));
        const todaysDate = new Date(date)
        let results = await Event.find({ eventEndDate: { $lte: todaysDate } });
        const ids = [];
        const finalizedIds = []
        await Promise.all(results.map(async (result) => {
            ids.push(result._id);
        }));
        await Promise.all(ids.map(async (val) => {
            let startAndEndDate = await Event.findById(val);
            const startDate = new Date(startAndEndDate.eventStartDate);
            const endDate = new Date(startAndEndDate.eventEndDate);
            const daysDifference = differenceInCalendarDays(endDate, startDate) + 1;
            let response = await attendanceModel.find({ event: val });
            if (response.length == daysDifference) {
                finalizedIds.push(val)
            }
        }));
        await Event.updateMany({ _id: { $in: finalizedIds } }, { $set: { eventStatus: 'ended' } });
    } catch (error) {
        console.log(error);
    }
});
