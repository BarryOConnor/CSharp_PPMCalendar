using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using SQLite;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace PPMCalendar.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventTypeController : Controller
    {
        /* get a list of eventTypes to populate the eventTypes dropdown in the website */
        [HttpGet("gettypes")]
        public ActionResult GetTypes()
        {
            List<EventType> eventTypes;

            using (DBManager db = new DBManager())
            {
                try
                {
                    eventTypes = db.GetEventTypes();
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError);
                }
            }

            return Ok(eventTypes);
        }

    }
}
