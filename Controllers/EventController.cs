using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PPMCalendar.Controllers
{

    /* Controller for events which handles all API calls relating to events */
    [Route("api/[controller]")]
    [ApiController]
    public class EventController : ControllerBase
    {

        /* Add Event */
        [HttpPost("add")]
        public ActionResult AddEvent([FromBody]Event details)
        {
            int returnvalue = 0;
            using (DBManager db = new DBManager())
            {
                try
                {
                    returnvalue = db.AddEvent(details);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError);
                }
            }

            return Ok(returnvalue);
        }

        /* Delete an existing Event based on ID */
        [HttpGet("delete/{id:int}/")]
        public ActionResult RemoveEvent(int id)
        {
            int returnvalue = 0;
            using (DBManager db = new DBManager())
            {
                try
                {
                    returnvalue = db.DeleteEvent(id);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError);
                }
            }

            return Ok(returnvalue);
        }

        /* Update Event */
        [HttpPost("update")]
        public ActionResult EditEvent([FromBody]Event details)
        {
            int returnvalue = 0;
            using (DBManager db = new DBManager())
            {
                try
                {
                    returnvalue = db.UpdateEvent(details);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError);
                }
            }

            return Ok(returnvalue);
        }

        /* Get events between 2 dates, used to populate the calendar */
        [HttpGet("getevent/{id:int}/{from}/{to}")]
        public ActionResult GetEvents(int id, string from, string to)
        {
            List<Event> events;
   
            using (DBManager db = new DBManager())
            {
                try
                {
                    events = db.GetEvent(id, from, to);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError);
                }
            }

            return Ok(events);
        }

        /* get a specific event based on ID */
        [HttpGet("getevent/{id:int}")]
        public ActionResult GetEventById(int id)
        {
            List<Event> events;

            using (DBManager db = new DBManager())
            {
                try
                {
                    events = db.GetEventById(id);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError);
                }
            }

            return Ok(events);
        }


    }
}