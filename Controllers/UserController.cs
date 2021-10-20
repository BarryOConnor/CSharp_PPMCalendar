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
    /* Handles all API calls relating to a user */
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : Controller
    {

        /* perform login operaqtiong using the submitted username and password */
        [HttpPost]
        public ActionResult Login([FromBody]LoginDetails details)
        {
            string response = "-1";

            try
            {
               using (DBManager db = new DBManager())
                { 
                   User user = db.GetUserByUsername(details.username);
                   if(user != null)
                   {
                       if (details.password == user.password) 
                       response = user.fullname + "|" + user.isAdmin + "|" + user.id;
                   }
               }
            }

            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
            return Ok(response);

        }

        /* add a user with the given information */
        [HttpPost("add")]
        public ActionResult AddUser([FromBody]User details)
        {
            int returnvalue = 0;
            using (DBManager db = new DBManager())
            {
                try
                {
                    returnvalue = db.AddUser(details);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError);
                }
            }

            return Ok(returnvalue);
        }

        /* delete a user based on ID */
        [HttpGet("delete/{id:int}/")]
        public ActionResult RemoveUser(int id)
        {
            int returnvalue = 0;
            using (DBManager db = new DBManager())
            {
                try
                {
                    returnvalue = db.DeleteUser(id);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError);
                }
            }

            return Ok(returnvalue);
        }

        /* update the user information of a specific user */
        [HttpPost("update")]
        public ActionResult EditUser([FromBody]User details)
        {
            int returnvalue = 0;
            using (DBManager db = new DBManager())
            {
                try
                {
                    returnvalue = db.UpdateUser(details);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError);
                }
            }

            return Ok(returnvalue);
        }

        /* get a specific user based on ID */
        [HttpGet("getuser/{id:int}/")]
        public ActionResult GetUserById(int id)
        {
            List<User> users;

            using (DBManager db = new DBManager())
            {
                try
                {
                    users = db.GetUserById(id);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError);
                }
            }

            return Ok(users);
        }

        /* get a list of all users within the system, used to populate the invitees list */
        [HttpGet("getusers")]
        public ActionResult GetUsers()
        {
            List<UserList> users;

            using (DBManager db = new DBManager())
            {
                try
                {
                    users = db.GetUsers();
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError);
                }
            }

            return Ok(users);
        }

    }
}