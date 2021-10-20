


/* ----------------------------------------
            Generic variables
---------------------------------------- */

//References to important controls for ease of access.  setup on the onLoad function below
var username = document.getElementById('username');
var miniCal = document.getElementById('calendar-small');
var mainCalendar = document.getElementById('calendar-body');
var monthCal = document.getElementById('calendar-monthly');
var weekCal = document.getElementById('calendar-weekly');
var dayCal = document.getElementById('calendar-daily');
var darklight = document.getElementById('darklight');
var monthAndYear = document.getElementById("monthAndYear");
var layout = document.getElementById('calendar-layout');

//variables used by the application
var calendarStartDate = "";
var calendarEndDate = "";
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


var userList;
var isUserAdmin = 0;
var userId = 0;

var today = new Date();
var currentMonth = today.getMonth();
var currentYear = today.getFullYear();
var currentDay = today.getDate();
var displayDay = new Date();
var displayWeek = new Date();

var sPath = window.location.pathname;
var sPage = sPath.substring(sPath.lastIndexOf('/') + 1);

var isMobile = false;


/* ----------------------------------------
            Code that's run onLoad of Document
---------------------------------------- */




document.addEventListener('DOMContentLoaded', function(event) {
/*******************************************************************
* This function runs when the document is loaded and contains
* setup code to set up some of the basics of the application
*******************************************************************/
//References to important controls for ease of access


    //-------------- Event Listeners --------------
 if(window.innerWidth < 750){
    isMobile = true;
 }
    document.getElementById("monthAndYear-week").innerHTML = months[today.getMonth()] + ", " + today.getFullYear();

    
    //twin event listeners to help differentiate between keyboard and mouse users
    document.body.addEventListener('mousedown', function() {
        //user is using a mouse, so remove keyboard styles
        document.body.classList.remove('using-keyboard');
    });

    document.body.addEventListener('keydown', function(event) {
        // Re-enable focus styling when Tab is pressed
        if (event.keyCode === 9) {
            document.body.classList.add('using-keyboard');
        }
    });

    //changes the theme of the app from light to dark and back
    //also changes cookie content
    var toggleDarkLight = function() {
        if(darklight.checked){
            document.body.classList.add('dark');
            document.body.classList.remove('light');
            bakeCookie('PPM-darkmode','dark',30);
        } else {
            document.body.classList.add('light');
            document.body.classList.remove('dark');
            bakeCookie('PPM-darkmode','light',30);
        }
    };

    //event listener to make the toggle switch use the above function
    darklight.addEventListener('click', toggleDarkLight, false);
    if (myswitch == 'light') {
        document.getElementById('darklight').checked = false;
    } else {
        document.getElementById('darklight').checked = true;
    }
    //change the contents of the user form when a different user is selected from the dropdown
    document.getElementById("user-id").addEventListener('change', function(event) {
      displayUser(document.getElementById("user-id").value);
    });


    //-------------- run onLoad Code --------------

    if (sPage != "index.html" && getCookie('PPM-username') == null ) {
        //check username is set for all pages except index otherwise logout
        logout();
    }

    //setup the user's fullname in the top left and whether they are admin or not
    if (document.contains(username)){
        let result = getCookie('PPM-username').split("|");
        username.innerHTML = result[0];
        isUserAdmin = result[1];
        userId = result[2];
    }

    //check for dark/light mode cookie and apply automatically
    if (getCookie('PPM-darkmode') != null) {
        var myswitch = getCookie('PPM-darkmode');
        if (myswitch == 'light') {
            document.getElementById('darklight').checked = false;
            document.body.classList.add('light');
            document.body.classList.remove('dark');
        } else {
            document.getElementById('darklight').checked = true;
            document.body.classList.add('dark');
            document.body.classList.remove('light');
        }
    } else {
        document.getElementById('darklight').checked = false;
    }


    //activate the admin controls if the user is admin
    if(isUserAdmin == 1) { 
        document.getElementById('admin-panel').classList.remove('hidden'); 
    }


    // used to handle the cookies bar at the top of the page 
    if(getCookie('PPM-cookies')!=null){
        document.getElementById( "cookiebar" ).className = 'hidden';
    } 


    // run the getUserList function to populate content
    getUserList();
    // run the getEventList function to populate content
    getEventList();
    //show the minicalendar
    showMiniCalendar(currentYear, currentMonth);
    //setup the layout of the main calendar
    changeLayout();
})


/* ----------------------------------------
                Generic Functions
---------------------------------------- */


    function poptoast(message){
    /*******************************************************************
    * This function is used to activate the popup messages
    *
    * input:
    * message: the text of the message body
    *******************************************************************/

        var toast = document.getElementById("toast");
        toast.innerHTML = message;
        toast.className = "popup";
        setTimeout(function(){ toast.classList.remove("popup"); }, 3000);  
    }


    /* ----------------------------------------
                Cookie Functions
    ---------------------------------------- */


    function acceptCookies(){
    /*******************************************************************
    * This function is used when a user accepts that the site uses cookies
    *
    *******************************************************************/
        document.getElementById( "cookiebar" ).className = 'hidden';
        bakeCookie('PPM-cookies','true',30);
    }        


    function bakeCookie(cookieName, cookieValue, days) {
    /*******************************************************************
    * This function is used to create a cookie
    *
    * input:
    * cookieName: the name of the cookie
    * cookieValue: the value of the cookie
    * days: how long until the cookie expires
    *******************************************************************/

        var cookieExpires = "";
        if (days) {
            var date = new Date();

            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            cookieExpires = "; expires=" + date.toUTCString();
        }
        document.cookie = cookieName + "=" + (cookieValue || "") + cookieExpires + "; path=/;SameSite=Strict";
    }



    function getCookie(cookieName) {
    /*******************************************************************
    * This function is used to retrieve the contents of a cookie
    *
    * input:
    * cookieName: the name of the cookie
    *******************************************************************/

        var cookieSearch = cookieName + "=";
        var cookieArray = document.cookie.split(';');

        for (var i = 0; i < cookieArray.length; i++) {
            var cookieElement = cookieArray[i];
            while (cookieElement.charAt(0) == ' ') cookieElement = cookieElement.substring(1, cookieElement.length);
            if (cookieElement.indexOf(cookieSearch) == 0) return cookieElement.substring(cookieSearch.length, cookieElement.length);
        }
        return null;
    }



    function eatCookie(cookieName) {
    /*******************************************************************
    * This function is used to delete an existing cookie
    *
    * input:
    * cookieName: the text of the message body
    *******************************************************************/

    	document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }


    /* ----------------------------------------
                Logout Function
    ---------------------------------------- */



    function logout(){
    /*******************************************************************
    * This function is used to log a user out of the system
    *******************************************************************/

        eatCookie('PPM-username');
        eatCookie('PPM-day');
        eatCookie('PPM-month');
        eatCookie('PPM-year');
        document.location.href="index.html";
    }



    function forceDoubleDigits(digitValue){
    /*******************************************************************
    * This function is used to force some date information to be 2 digits
    * for example, January is stored as a 1, we need it to be 01
    *
    * input:
    * digitValue: the number to be edited
    *******************************************************************/

    	return (digitValue < 10) ? "0" + digitValue: digitValue;
    }



    function daysInMonth(month, year) {
    /*******************************************************************
    * This function returns the days in a given month
    *
    * input:
    * month: the month
    * year: the year
    *******************************************************************/

        return 32 - new Date(year, month, 32).getDate();
    }


function changeLayout(layoutType="none") {
    /*******************************************************************
    * This function updates the layout of the calendar when a user changes
    * which view they would like to see
    *
    * input:
    * layoutType: the name of the layout to display
    *******************************************************************/

        if(getCookie('PPM-layout') != null && layoutType == "none"){
            layoutType = getCookie('PPM-layout');
        } else if(layoutType == "none"){
            layoutType = "monthly";
        }


        if(layoutType=="monthly"){
            mainCalendar.innerHTML = monthCal.innerHTML;
            bakeCookie('PPM-layout','monthly',30);
            layout.innerHTML="Monthly";
            showMonthlyCalendar(currentYear, currentMonth);
        } else if(layoutType=="weekly"){
            bakeCookie('PPM-layout','weekly',30);
            layout.innerHTML="Weekly";
            showWeeklyCalendar(currentYear, currentMonth, currentDay);
        } else {
            bakeCookie('PPM-layout','daily',30);
            layout.innerHTML="Daily";
            showDailyCalendar(currentYear, currentMonth, currentDay);
        }

        document.body.classList.remove('monthly');
        document.body.classList.remove('weekly');
        document.body.classList.remove('daily');
        document.body.classList.add(layoutType);
    };




/* ----------------------------------------
           User Functions
---------------------------------------- */   


function createUserObject(){
/*******************************************************************
* This function creates a JSON object to store user information ready for AJAX
*
* output:
* a JSON Object containing user data
*******************************************************************/

    let userObject = { "id": 0, "fullname": "null", "isAdmin": 0, "email": "", "totalHolidays": 0, "remainingHolidays": "0", "phoneNumber": "", "username": "null", "password": "null" };

    userObject.id = document.getElementById("user-id").value;
    userObject.fullname = document.getElementById("user-fullname").value;
    userObject.isAdmin = document.getElementById("user-isAdmin").selectedIndex;
    userObject.email = document.getElementById("user-email").value;
    userObject.totalHolidays = document.getElementById("user-holidays").value;
    userObject.remainingHolidays = document.getElementById("user-remaining").value;
    userObject.phoneNumber = document.getElementById("user-phone").value;
    userObject.username = document.getElementById("user-username").value;
    userObject.password = document.getElementById("user-password").value;
    return userObject;
}



function getUserList(data){
/*******************************************************************
* This function retrieves a current list of users using ajax and uses these to populate
* the datalast for attendees and the admin user list
*
*******************************************************************/
           
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("user-id").innerHTML = "<option value=\"0\">--- select a user ---</option>";
            document.getElementById("email-suggest").innerHTML = "";
            var userList = JSON.parse(this.responseText);
            for(var i = 0; i < userList.length; i++) {
                //elements: =id, title, eventTypeId, startTime, endTime, location, creatorId, approvedById, approved, assignedTo
                var user = userList[i];
                document.getElementById("user-id").innerHTML +="<option value=\"" + user.id + "\">" + user.fullname + "</option>";
                document.getElementById("email-suggest").innerHTML += "<option>" + user.email + "</option>";
            }
        }
    };

    xhttp.open("GET", "/api/user/getusers", true);  
    xhttp.send();
}



function showUserContent(){
/*******************************************************************
* This function sets up the user form to be blank to add a new user
*
* this fucntion maily changes button visibility to make sure a user
* is not confused by several buttons not relating to the action
*******************************************************************/

    document.getElementById("user-select").className = "form-row hidden";
    document.getElementById("user-content").className = "form-row";
    document.getElementById("user-delete").className = "hidden";
    document.getElementById("user-update").className = "hidden";
    document.getElementById("user-create").className = "hidden";

    // display the form with default content
    displayUser(0);
}



function showUserSelect(){
/*******************************************************************
* This function returns the user from so that an admin can choose a
* user they wish to edit or delete
*
* this fucntion maily changes button visibility to make sure a user
* is not confused by several buttons not relating to the action
*******************************************************************/

    document.getElementById("user-select").className = "form-row";
    document.getElementById("user-content").className = "form-row hidden";
    document.getElementById("user-id").value = 0;
    document.getElementById("user-modal-title").innerHTML = "Select a user";
    document.getElementById("user-delete").className = "hidden";
    document.getElementById("user-update").className = "hidden";
    document.getElementById("user-create").className = "hidden";
    MicroModal.show('user-modal');
}



function addUser(){
/*******************************************************************
* This function posts user information to the API backend so that it can 
* add a new user
*
*******************************************************************/

    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', 'api/user/add');
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.onload = function() {
        if (xhttp.status === 200) {
            var events = parseInt(this.responseText);
            if(events > 0) {
                alert("The user was successfully added");
            } else {
                alert("The user was not added, please try again later");
            }
            getUserList();
            MicroModal.close('user-modal');
        } else if (xhttp.status !== 200) {
            alert('The user was not added, please try again later');
        }
    };
    xhttp.send(JSON.stringify(createUserObject()));
    alert(JSON.stringify(createUserObject()));
}



function updateUser(){
/*******************************************************************
* This function posts user information to the API backend so that it can 
* update an existing user
*
*******************************************************************/

    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', 'api/user/update');
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.onload = function() {
        if (xhttp.status === 200) {
            var users = parseInt(this.responseText);
            if(users > 0) {
                alert("The user was successfully updated");
            } else {
                alert("The user was not updated, please try again later");
            }
            getUserList();
            MicroModal.close('user-modal');
        } else if (xhttp.status !== 200) {
            alert('The user was not updated, please try again later');
        }
    };
    xhttp.send(JSON.stringify(createUserObject()));
    //alert(JSON.stringify(createUserObject()));
}



function deleteUser(){
/*******************************************************************
* This function posts user information to the API backend so that it can 
* delete an existing user
*
*******************************************************************/

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var users = parseInt(this.responseText);
            if(users > 0) {
                alert("The user was successfully deleted");
            } else {
                alert("The user was not deleted, please try again later");
            }
            getUserList();
            MicroModal.close('user-modal');
        }
    };
    
    xhttp.open("GET", 'api/user/delete/'+ document.getElementById("user-id").value, true)
    xhttp.send();
}



function displayUser(userId){
/*******************************************************************
* This function displays an empty form for a new user or populates
* the form with an existing user's information from the API

* input:
* userId: the userId of the existing user (or 0 for a new user)
*
*******************************************************************/
    if(userId==0){
        //it's a new user, fill with default data
        document.getElementById("user-modal-title").innerHTML = "New User";
        document.getElementById("user-id").value = 0;
        document.getElementById("user-fullname").value = "";
        document.getElementById("user-isAdmin").value = 0;
        document.getElementById("user-email").value = "";
        document.getElementById("user-holidays").value = 20;
        document.getElementById("user-remaining").value = 20;
        document.getElementById("user-phone").value = "";
        document.getElementById("user-username").value = "";
        document.getElementById("user-password").value = "";

        document.getElementById("user-create").className = "";
    } else {
        //get the existing user's data from the backend and display it
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var users = JSON.parse(this.responseText);

                for(var i = 0; i < users.length; i++) {
                    var user = users[i];
                    //populate the form with the data from the API for the selected user
                    document.getElementById("user-content").className = "form-row";
                    document.getElementById("user-modal-title").innerHTML = user.fullname;
                    document.getElementById("user-id").value = user.id;
                    document.getElementById("user-fullname").value = user.fullname;
                    document.getElementById("user-isAdmin").value = parseInt(user.isAdmin);
                    document.getElementById("user-email").value = user.email;
                    document.getElementById("user-holidays").value = user.totalHolidays;
                    document.getElementById("user-remaining").value = user.remainingHolidays;
                    document.getElementById("user-phone").value = user.phoneNumber;
                    document.getElementById("user-username").value = user.username;
                    document.getElementById("user-password").value = user.password; 

                    document.getElementById("user-delete").className = "";
                    document.getElementById("user-update").className = "";
                }
            }

        };
        xhttp.open("GET", 'api/user/getuser/' + userId);
        xhttp.send();
    }
    MicroModal.show('user-modal');
}






/* ----------------------------------------
           Event Functions
---------------------------------------- */

    function getEventList(){
    /*******************************************************************
    * This function GETs event types from the API and populates the
    * event type select element in the event form
    *******************************************************************/
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                //set the default option
                document.getElementById("event-type").innerHTML = "<option value=\"0\">--- select a type ---</option>";
                var eventTypeList = JSON.parse(this.responseText);
                for(var i = 0; i < eventTypeList.length; i++) {
                    var eventType = eventTypeList[i];
                    //add an option for each event type
                    document.getElementById("event-type").innerHTML +="<option value=\"" + eventType.id + "\">" + eventType.name + "</option>";
                }
            }
        };

        xhttp.open("GET", "/api/eventtype/gettypes", true);  
        xhttp.send();
    }



    function createEventObject(){
    /*******************************************************************
    * This function creates a JSON object to store user information ready for AJAX
    *
    * output:
    * a JSON Object containing user data
    *******************************************************************/

        const NOT_APPROVED = 0;
        const NOBODY = 0;
    	let eventObject = { "id": 0, "title": "null", "eventTypeId": 0, "invitees": "null", "creatorId": 0, "startTime": "yyyy-mm-dd hh:mm:ss", "endTime": "yyyy-mm-dd hh:mm:ss", "location": "null", "description": "null", "approvedById": 0, "approved": 0, "notification": 0, "repeatDays": 0, "repeatUntil": "yyyy-mm-dd hh:mm:ss", "isRepeat": 0 };
    	
    	eventObject.id = document.getElementById("event-id").value;
    	eventObject.title = document.getElementById("event-title").value;
    	eventObject.eventTypeId = document.getElementById("event-type").value;
        eventObject.invitees = document.getElementById("event-invitees").value;
        eventObject.creatorId = document.getElementById("event-creator").value = userId;
        eventObject.startTime = document.getElementById("event-fromdate").value + " " + document.getElementById("event-fromtime").value + ":00";
        eventObject.endTime = document.getElementById("event-todate").value + " " + document.getElementById("event-totime").value + ":00";
        eventObject.location = document.getElementById("event-location").value;
        eventObject.description = document.getElementById("event-description").value;
        eventObject.approvedById = document.getElementById("event-approvedby").value;
        eventObject.approved = document.getElementById("event-approved").value;
        eventObject.notification = document.getElementById("event-notification").value;
        eventObject.repeatDays = document.getElementById("event-repeat-days").value;
        eventObject.repeatUntil = document.getElementById("event-repeat-until").value;
        eventObject.isRepeat = document.getElementById("event-repeat").value;

        if(document.getElementById("event-approved").value != NOT_APPROVED && document.getElementById("event-approvedby").value == NOBODY){
            eventObject.approvedById = userId;
        }

        return eventObject;
    }



    function addEvent(){
    /*******************************************************************
    * This function posts event information to the API backend so that it can 
    * add a new event
    *
    *******************************************************************/

        if(validateForm(document.getElementById('form-event'))) {
        	var xhttp = new XMLHttpRequest();
            xhttp.open('POST', 'api/event/add');
            xhttp.setRequestHeader('Content-Type', 'application/json');
            xhttp.onload = function() {
                if (xhttp.status === 200) {
                    var events = parseInt(this.responseText);
                	if(events > 0) {
                		poptoast("The event was successfully added");
                	} else {
                		poptoast("The event was not added, please try again later");
                	}
                    
                	refreshCalendar();
                	MicroModal.close('event-modal');
                } else if (xhttp.status !== 200) {
                    poptoast('The event was not added, please try again later');
                }
            };
            xhttp.send(JSON.stringify(createEventObject()));
            //alert(JSON.stringify(createEventObject()));
        }
    }
 


    function updateEvent(){
    /*******************************************************************
    * This function posts event information to the API backend so that it can 
    * update an existing event
    *
    *******************************************************************/
        if(validateForm(document.getElementById('form-event'))) {
        	var xhttp = new XMLHttpRequest();
            xhttp.open('POST', 'api/event/update');
            xhttp.setRequestHeader('Content-Type', 'application/json');
            xhttp.onload = function() {
                if (xhttp.status === 200) {
                    var events = parseInt(this.responseText);
                	if(events > 0) {
                		poptoast("The event was successfully updated");
                	} else {
                		poptoast("The event was not updated, please try again later");
                	}
                    
                	refreshCalendar();
                	MicroModal.close('event-modal');
                } else if (xhttp.status !== 200) {
                    poptoast('The event was not updated, please try again later');
                }
            };
            xhttp.send(JSON.stringify(createEventObject()));
            //alert(JSON.stringify(createEventObject()));
        }       
    }



    function deleteEvent(){
    /*******************************************************************
    * This function posts event information to the API backend so that it can 
    * delete an existing event
    *
    *******************************************************************/

    	let xhttp = new XMLHttpRequest();
    	xhttp.onreadystatechange = function() {
    		if (this.readyState == 4 && this.status == 200) {
                var events = parseInt(this.responseText);
            	if(events > 0) {
            		poptoast("The event was successfully deleted");
            	} else {
            		poptoast("The event was not deleted, please try again later");
            	}
            	refreshCalendar();
            	MicroModal.close('event-modal');
    	    }
    	};
    	
    	xhttp.open("GET", 'api/event/delete/'+ document.getElementById("event-id").value, true)
    	xhttp.send();
    }



    function displayEvent(eventId,varEventDate="0000-00-00"){
    /*******************************************************************
    * This function populates the event form with data. This can be default data for a new
    * event or existing data from the database
    *
    * input:
    * eventId: the id of the event (0 signifies a new event)
    * varEventDate: the date the event should be created on (passes date of the day you click)
    *******************************************************************/

        let now = new Date();
        let dateNow = now.getFullYear() + "-" + forceDoubleDigits(now.getMonth()+1) + "-" + forceDoubleDigits(now.getDate());
        let timeNow = forceDoubleDigits(now.getHours()) + ":" + forceDoubleDigits(now.getMinutes());

    	if(eventId==0){	
            // it's a new event dso populate with default data	
    		let eventDate = new Date(varEventDate);
            let eventDateformatted = eventDate.getFullYear() + "-" + forceDoubleDigits(eventDate.getMonth()+1) + "-" + forceDoubleDigits(eventDate.getDate());
    		document.getElementById("event-modal-title").innerHTML = "New Event";

    		document.getElementById("event-id").value = "0";
    	    document.getElementById("event-title").value = "";
    	    document.getElementById("event-type").selectedIndex = 0;
            document.getElementById("event-invitees").value = "";
            document.getElementById("event-creator").value = userId;
            document.getElementById("event-fromdate").value = eventDateformatted;
            document.getElementById("event-fromtime").value = timeNow;
        	document.getElementById("event-todate").value = eventDateformatted;
            document.getElementById("event-totime").value = timeNow;
            document.getElementById("event-location").value = "";
            document.getElementById("event-description").value = "";
            document.getElementById("event-approvedby").value = 0;
            document.getElementById("event-approved").value = 0; 
            document.getElementById("event-notification").value = 0;
            document.getElementById("event-repeat-days").value = 0;
            document.getElementById("event-repeat-until").value = dateNow;
            document.getElementById("event-repeat").value=0;

            document.getElementById("event-approval").className = "form-row hidden";

            document.getElementById("event-delete").classList.add("hidden");
            document.getElementById("event-update").classList.add("hidden");
            document.getElementById("event-create").classList.remove("hidden");

    	} else {
            // it's an existing event so fetch the data from the API
            const HOLIDAY_REQUEST = 9;
    		let xhttp = new XMLHttpRequest();
    		xhttp.onreadystatechange = function() {
    			if (this.readyState == 4 && this.status == 200) {
    	            var events = JSON.parse(this.responseText);
    	            for(var i = 0; i < events.length; i++) {
    	            	var event = events[i];
                        // populate the form with the selected event data from the API
    	            	document.getElementById("event-modal-title").innerHTML = event.title;
    	                document.getElementById("event-id").value = event.id;
    				    document.getElementById("event-title").value = event.title;
    				    document.getElementById("event-type").value = parseInt(event.eventTypeId);
    			        document.getElementById("event-invitees").value = (event.invitees == 0) ? "": event.invitees;
    			        document.getElementById("event-creator").value = event.creatorId;
    			        document.getElementById("event-fromdate").value = event.startTime.substring(0, 10);
    			        document.getElementById("event-fromtime").value = event.startTime.substring(11, 16);
    			    	document.getElementById("event-todate").value =event.endTime.substring(0, 10);
    			        document.getElementById("event-totime").value =event.endTime.substring(11, 16);
    			        document.getElementById("event-location").value = event.location;
    			        document.getElementById("event-description").value = event.description;
    			        document.getElementById("event-approvedby").value = event.approvedById;
    			        document.getElementById("event-approved").value = parseInt(event.approved);
                        document.getElementById("event-notification").value = parseInt(event.notification);
                        document.getElementById("event-repeat-days").value = parseInt(event.repeatDays);
                        if(event.repeatUntil=="") event.repeatUntil = dateNow; // set the repeat until date to today if it's empty (form element will not validate)
                        document.getElementById("event-repeat-until").value = event.repeatUntil;
                        document.getElementById("event-repeat").value = event.isRepeat;

                        //only show the approval section for a holiday request event AND if the user is an admin
                        if((parseInt(event.eventTypeId) == HOLIDAY_REQUEST || event.approvedById == userId) && isUserAdmin){
                             document.getElementById("event-approval").className= "form-row";
                        }    

    	                document.getElementById("event-delete").classList.remove("hidden");
    	                document.getElementById("event-update").classList.remove("hidden");
    	                document.getElementById("event-create").classList.add("hidden");
    				}
    		    }
    		};
    		xhttp.open("GET", 'api/event/getevent/' + eventId);
    		xhttp.send();
    	}
    	MicroModal.show('event-modal');
    }



    function populateCalendar() {
    /*******************************************************************
    * This function populates the main calendar with events from the API
    * It handles the data a little differently depending on whether
    * the calendar mode is Daily, Weekly or Monthly.
    *
    *******************************************************************/

        let xhttp = new XMLHttpRequest();
    	xhttp.onreadystatechange = function() {
    		if (this.readyState == 4 && this.status == 200) {
                var events = JSON.parse(this.responseText);
                
                for(var i = 0; i < events.length; i++) {
                	
    			    var event = events[i];
                    var ariastring = "";
                    var ariadate = "";
    			    if (document.contains(document.querySelector(".monthly #calendar-body"))){  //code for monthly calendar
    			    	let findThisElement = "#calendar-body #day-" + event.startTime.substring(0, 10);

                        //set up the arial-label information
                        ariaDate = new Date(event.startTime);
                        ariastring = parseInt(event.startTime.substring(8, 10)) + ", " + days[ariaDate.getDay()] + " " +months[parseInt(event.startTime.substring(5, 7))] + " " + event.startTime.substring(0, 4) + ", " + event.title;

    			    	document.querySelector(findThisElement).innerHTML += "<button onClick=\"displayEvent("+event.id+")\" class=\"event event-type-" + event.eventTypeId + "\" id=\"event-" + event.id + "\" data-modal-content-id=\"newevent\" data-modal-background-click=\"disabled\" data-event-id=\"" + event.id + "\" aria-label=\"" + ariastring + "\"><span class=\"title\">" + event.title + "</span><span class=\"time\">" + event.startTime.substring(11, 16) + "-" + event.endTime.substring(11, 16) + "</span></button>";
    			    }
    			    if (document.contains(document.querySelector(".weekly #calendar-body"))){  //code for weekly calendar
    			    	let dayOfWeek = new Date(event.startTime).getDay();
    			    	let findThisElement = "#calendar-body #weekly-" + days[dayOfWeek];

                        //set up the arial-label information
                        ariaDate = new Date(event.startTime);
                        ariastring = parseInt(event.startTime.substring(8, 10)) + ", " + days[ariaDate.getDay()] + " " +months[parseInt(event.startTime.substring(5, 7))] + " " + event.startTime.substring(0, 4) + ", " + event.title;

    	    			document.querySelector(findThisElement).innerHTML += "<button onClick=\"displayEvent("+event.id+")\" class=\"event event-type-" + event.eventTypeId + "\" id=\"event-" + event.id + "\" data-modal-content-id=\"newevent\" data-modal-background-click=\"disabled\" data-event-id=\"" + event.id + "\" aria-label=\"" + ariastring + "\"><span class=\"title\">" + event.title + "</span><span class=\"time\">" + event.startTime.substring(11, 16) + "-" + event.endTime.substring(11, 16) + "</span></button>";
    	    		}
    	    		if (document.contains(document.querySelector(".daily #calendar-body"))){  //code for daily calendar
    	    			let findThisElement = "#calendar-body #daily-content";

                        //set up the arial-label information
                        ariaDate = new Date(event.startTime);
                        ariastring = parseInt(event.startTime.substring(8, 10)) + ", " + days[ariaDate.getDay()] + " " +months[parseInt(event.startTime.substring(5, 7))] + " " + event.startTime.substring(0, 4) + ", " + event.title;

    			    	document.querySelector(findThisElement).innerHTML += "<button onClick=\"displayEvent("+event.id+")\" class=\"event event-type-" + event.eventTypeId + "\" id=\"event-" + event.id + "\" data-modal-content-id=\"newevent\" data-modal-background-click=\"disabled\" data-event-id=\"" + event.id + "\" aria-label=\"" + ariastring + "\"><span class=\"title\">" + event.title + "</span><span class=\"time\">" + event.startTime.substring(11, 16) + "-" + event.endTime.substring(11, 16) + "</span></button>";
    			    }

                    
    			}
    	    }
    	};

    	xhttp.open("GET", 'api/event/getevent/' + userId + '/' + calendarStartDate + "/" + calendarEndDate, true);	
    	xhttp.send();
    }





/* ----------------------------------------
           Mini Calendar Functions
---------------------------------------- */

	function miniCalNext(duration="month") {
    /*******************************************************************
    * This function handles the onClick event of the next button on the mini
    * calendar. It moves the calendar onto the next month and calls other functions
    * to update the contents of the calendar
    *
    *******************************************************************/
        if (duration == "month"){
    	    currentYear = (currentMonth === 11) ? currentYear + 1 : currentYear;
    	    currentMonth = (currentMonth + 1) % 12;

            //update the mini calendar
    	    showMiniCalendar(currentYear, currentMonth);
            document.getElementById("monthAndYear-month").innerHTML = months[currentMonth] + ", " + currentYear;
            // check which calendar is presently being used and update it
            refreshCalendar();
        }
        if (duration == "week"){
            displayWeek.setDate(displayWeek.getDate() + 7);

            showWeeklyCalendar(displayWeek.getFullYear(), displayWeek.getMonth(), displayWeek.getDate())
            document.getElementById("monthAndYear-week").innerHTML = months[displayWeek.getMonth()] + ", " + displayWeek.getFullYear();
        }
        if (duration == "day"){            
            displayDay.setDate(displayDay.getDate() + 1);

            showDailyCalendar(displayDay.getFullYear(), displayDay.getMonth(), displayDay.getDate() )
            document.getElementById("monthAndYear-day").innerHTML = displayDay.getDate() + " " + months[displayDay.getMonth()] + ", " + displayDay.getFullYear();
        }

	}



	function miniCalPrevious(duration="month") {
    /*******************************************************************
    * This function handles the onClick event of the previous button on the mini
    * calendar. It moves the calendar onto the previous month and calls other functions
    * to update the contents of the calendar
    *
    *******************************************************************/

        if (duration == "month"){
            currentYear = (currentMonth === 0) ? currentYear - 1 : currentYear;
            currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;

            //update the mini calendar
            showMiniCalendar(currentYear, currentMonth);
            document.getElementById("monthAndYear-month").innerHTML = months[currentMonth] + ", " + currentYear;
            // check which calendar is presently being used and update it
            refreshCalendar();
        }
        if (duration == "week"){
            displayWeek.setDate(displayWeek.getDate() - 7);

            showWeeklyCalendar(displayWeek.getFullYear(), displayWeek.getMonth(), displayWeek.getDate())
            document.getElementById("monthAndYear-week").innerHTML = months[displayWeek.getMonth()] + ", " + displayWeek.getFullYear();
        }
        if (duration == "day"){            
            displayDay.setDate(displayDay.getDate() - 1);

            showDailyCalendar(displayDay.getFullYear(), displayDay.getMonth(), displayDay.getDate() )
            document.getElementById("monthAndYear-day").innerHTML = displayDay.getDate() + " " + months[displayDay.getMonth()] + ", " + displayDay.getFullYear();
        }

	}



    function refreshCalendar(){
    /*******************************************************************
    * This function the content on the main calendar and is typically used
    * when the API has new data (event add, event delete etc)
    * this keeps the calendar up to date
    *******************************************************************/

        if (document.contains(document.querySelector(".monthly #calendar-body"))){
            showMonthlyCalendar(currentYear, currentMonth);
        }
        if (document.contains(document.querySelector(".weekly #calendar-body"))){
            showWeeklyCalendar(currentYear, currentMonth);
        }
        if (document.contains(document.querySelector(".daily #calendar-body"))){
            showDailyCalendar(currentYear, currentMonth);
        }
    }



	function showMiniCalendar(year, month) {
    /*******************************************************************
    * This function generates the layout for the mini calendar and creates the onClick
    * events which handle clicking on a specific day.
    * This allows the calendar to change the current day or week in Weekly
    * and Daily Modes
    *
    * input:
    * month: the month the calendar should display
    * year: the year the calendar should display
    *******************************************************************/

		let minicalString = "";
	    let firstDay = (new Date(year, month)).getDay();
	    let date = 1;
	    let nextMonthDate = 1;
	    let prevMonthDate = daysInMonth(month-1, year);
	    let prevYear = year;
	    let nextYear = year;
	    let prevMonth = month-1;
	    let nextMonth = month+1;
        let ariastring = "";
        let ariadate = "";
        let minicalStartDate = "";
        let minicalEndDate = "";




	    if(month == 0) { prevYear--; prevMonth=11; };
		if(month == 11) { nextYear++; nextMonth=0; };

        //handle aria labels on the date on prev and next buttons for accessibility
        document.getElementById("mini-previous").setAttribute("aria-label", "Previous month, " + months[prevMonth] + " " + prevYear);
        document.getElementById("mini-next").setAttribute("aria-label", "Next month, " + months[nextMonth] + " " + nextYear);

	    // clearing all previous cells
	    miniCal.innerHTML = "";

	    // filing data about month and in the page via DOM.
	    monthAndYear.innerHTML = months[month] + ", " + year;
        document.getElementById("monthAndYear-month").innerHTML = months[month] + ", " + year;

	    //fill the headers
	    minicalString += "<div class=\"header\"><span class=\"date-header\">S</span></div>";
	    minicalString += "<div class=\"header\"><span class=\"date-header\">M</span></div>";
	    minicalString += "<div class=\"header\"><span class=\"date-header\">T</span></div>";
	    minicalString += "<div class=\"header\"><span class=\"date-header\">W</span></div>";
	    minicalString += "<div class=\"header\"><span class=\"date-header\">T</span></div>";
	    minicalString += "<div class=\"header\"><span class=\"date-header\">F</span></div>";
	    minicalString += "<div class=\"header\"><span class=\"date-header\">S</span></div>";


	    // creating all dates

	    for (let calRows = 0; calRows < 5; calRows++) {
	        //creating individual cells, filing them up with data.
	        for (let calCells = 0; calCells < 7; calCells++) {
	            if (calRows === 0 && calCells < firstDay) {
	            	prevMonthDate = daysInMonth(month-1, year) - (firstDay-(calCells+1));

                    if(calRows ===0 && calCells ===0) { minicalStartDate = prevYear + "-" + forceDoubleDigits(prevMonth + 1) + "-" + forceDoubleDigits(prevMonthDate); }

                    //handle aria label on the date for accessibility
                    ariadate = new Date(prevYear + "-" + forceDoubleDigits(prevMonth + 1) + "-" + forceDoubleDigits(prevMonthDate));
                    ariastring = prevMonthDate + ", " + days[ariadate.getDay()] + " " + months[prevMonth + 1] + " " + prevYear;

	                minicalString += "<div id=\"mc-" + prevYear + "-" + forceDoubleDigits(prevMonth + 1) + "-" + forceDoubleDigits(prevMonthDate) + "\" class=\"day\"><a href=\"javascript:void(0);\" class=\"day-border\" data-year=\"" + prevYear + "\"  data-month=\"" + prevMonth + "\" aria-label=\"" + ariastring + "\"><span class=\"date\">" + prevMonthDate + "</span></a></div>";
	            }
	            else if (date > daysInMonth(month, year)) {
	            	//completed current date, start next months dates

                    if(calRows ===4 && calCells ===6) { minicalEndDate = nextYear + "-" + forceDoubleDigits(nextMonth + 1) + "-" + forceDoubleDigits(nextMonthDate); }

                    //handle aria label on the date for accessibility
                    ariadate = new Date(nextYear + "-" + forceDoubleDigits(nextMonth + 1) + "-" + forceDoubleDigits(nextMonthDate));
                    ariastring = nextMonthDate + ", " + days[ariadate.getDay()] + " " + months[nextMonth + 1] + " " + nextYear;

	                minicalString += "<div id=\"mc-" + nextYear + "-" + forceDoubleDigits(nextMonth + 1) + "-" + forceDoubleDigits(nextMonthDate) + "\" class=\"day\"><a href=\"javascript:void(0);\" class=\"day-border\" data-year=\"" + nextYear + "\"  data-month=\"" + nextMonth+ "\" aria-label=\"" + ariastring + "\"><span class=\"date\">" + nextMonthDate +"</span></a></div>";
	                nextMonthDate++;
	            } else {

                    //handle aria label on the date for accessibility
                    ariadate = new Date(currentYear + "-" + forceDoubleDigits(month + 1) + "-" + forceDoubleDigits(date));
                    ariastring = date + ", " + days[ariadate.getDay()] + " " + months[month + 1] + " " + currentYear;

                    if(calRows ===0 && calCells ===0) { minicalStartDate = year + "-" + forceDoubleDigits(month + 1) + "-" + forceDoubleDigits(date); }
                    if(calRows ===4 && calCells ===6) { minicalEndDate = year + "-" + forceDoubleDigits(month + 1) + "-" + forceDoubleDigits(date); }

	                minicalString += "<div id=\"mc-" + currentYear + "-" + forceDoubleDigits(month + 1) + "-" + forceDoubleDigits(date) + "\" class=\"day\"><a href=\"javascript:void(0);\" class=\"day-border\" data-year=\"" + currentYear + "\"  data-month=\"" + month + "\"";
	                if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
	                    minicalString +=  " aria-label=\"" + ariastring + ", Today\"><span class=\"date today";
	                } else {
                        minicalString +=  " aria-label=\"" + ariastring + ", Today\"><span class=\"date";
                    }
	                minicalString += "\">" + date +"</span></a></div>";
	                date++;
	            }
	        }
	    }
	    miniCal.innerHTML = minicalString;

        //reset classes before update
        var everyChild = document.querySelectorAll("#calendar-small div");
        for (var i = 0; i<everyChild.length; i++) {
            everyChild[i].classList.remove("has-content");
        }

        //update the mini calendar to highlight days with events
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var events = JSON.parse(this.responseText);
                for(var i = 0; i < events.length; i++) {
                    var event = events[i];
                    //code for mini calendar which indicates whether a given day has content (line under box)
                    let findThisMinicalElement = "#calendar-small #mc-" + event.startTime.substring(0, 10) + " a";
                    document.querySelector(findThisMinicalElement).classList.add("has-content");
                }
            }
        };

        xhttp.open("GET", 'api/event/getevent/' + userId + '/' + minicalStartDate + "/" + minicalEndDate, true);  
        xhttp.send();



	    let mincalElements = document.getElementsByClassName('day-border');
	    let minicalActiveDay = function() {
            //On CLick handler for the dyas on the mini calendar.
            //changed the currently selected date and updates weekly and daily calendars
       		for (let i = 0; i < mincalElements.length; i++) {
            	mincalElements[i].classList.remove('active');
        	}
        	this.classList.add('active');
        	if (document.contains(document.querySelector(".weekly #calendar-body"))){
    			showWeeklyCalendar(this.getAttribute("data-year"), this.getAttribute("data-month"), this.children[0].innerHTML);
    		}
    		if (document.contains(document.querySelector(".daily #calendar-body"))){
    			showDailyCalendar(this.getAttribute("data-year"), this.getAttribute("data-month"), this.children[0].innerHTML);
    		}
    	};

    	for (let i = 0; i < mincalElements.length; i++) {
        	mincalElements[i].addEventListener('click', minicalActiveDay, false);
    	}
    }    




/* ----------------------------------------
           Monthly Calendar Functions
---------------------------------------- */

    function showMonthlyCalendar(year, month) {
    /*******************************************************************
    * This function generates the layout for the monthly calendar and creates 
    * the onClick events that allow you to create a new event by clicking on 
    * an empty field in the calendar
    *
    * input:
    * month: the month the calendar should display
    * year: the year the calendar should display
    *******************************************************************/
		let mainCalendarString = "";
	    let firstDay = (new Date(year, month)).getDay();
	    let date = 1;
	    let nextMonthDate = 1;
	    let prevMonthDate = daysInMonth(month-1, year);
	    let thisMonth = "";
	    let thisDate = "";
        let ariadate = "";
        let ariastring = "";

	    // creating all dates
    	let dayContents = document.querySelectorAll("#calendar-body .day");
    	let dayCount = 0;

	    for (let calRows = 0; calRows < 5; calRows++) {
	        //creating individual cells, filing them up with data.
	        for (let calCells = 0; calCells < 7; calCells++) {

	            if (calRows === 0 && calCells < firstDay) {
                    // it's a day at the end of the previous month
	            	prevMonthDate = daysInMonth(month-1, year) - (firstDay-(calCells+1));
	            	thisDate = forceDoubleDigits(prevMonthDate);
	            	thisMonth = forceDoubleDigits(month);

	            	if(calRows ===0 && calCells ===0) { calendarStartDate = year + "-" + thisMonth + "-" + thisDate; }
	                
	                dayContents[dayCount].children[0].innerHTML = prevMonthDate;
	                prevMonthDate++
	            }
	            else if (date > daysInMonth(month, year)) {
	            	//it's a day at the start of the next month
	            	thisDate = forceDoubleDigits(nextMonthDate);
	            	thisMonth = forceDoubleDigits(month + 2);

	            	if(calRows ===4 && calCells ===6) { calendarEndDate = year + "-" + thisMonth + "-" + thisDate; }

	                dayContents[dayCount].children[0].innerHTML = nextMonthDate;
	                nextMonthDate++;
	            } else {
                    //it's a day in the current month
	            	thisDate = forceDoubleDigits(date);
	            	thisMonth = forceDoubleDigits(month + 1);

	            	if(calRows ===0 && calCells ===0) { calendarStartDate = year + "-" + thisMonth + "-" + thisDate; }
					if(calRows ===4 && calCells ===6) { calendarEndDate = year + "-" + thisMonth + "-" + thisDate; }

	                dayContents[dayCount].children[0].innerHTML = date;
	                date++;
	            }
                //handle aria label on the date for accessibility
                ariadate = new Date(year + "-" + thisMonth + "-" + thisDate);
                ariastring = thisDate + ", " + days[ariadate.getDay()] + " " + months[parseInt(thisMonth)] + " " + year;

	            dayContents[dayCount].children[1].id = "day-" + year + "-" + thisMonth + "-" + thisDate;
	            dayContents[dayCount].onClick = function () {displayEvent(0, year + "-" + thisMonth + "-" + thisDate)};
	            dayContents[dayCount].setAttribute( "onClick", "displayEvent(0, \"" +year + "-" + thisMonth + "-" + thisDate + "\")" );
                dayContents[dayCount].setAttribute( "aria-label", ariastring );
	            dayContents[dayCount].children[1].innerHTML = "";
	            dayCount++;
	        }
	    }
	    populateCalendar();
	}




/* ----------------------------------------
           Weekly Calendar Functions
---------------------------------------- */


    
	function showWeeklyCalendar(year, month, targetdate=1) {
    /*******************************************************************
    * This function generates the layout for the weekly calendar and creates 
    * the onClick events that allow you to create a new event by clicking on 
    * an empty field in the calendar
    *
    * input:
    * month: the month the calendar should display
    * year: the year the calendar should display
    * targetdate: the date we want to target (the week containing this date will be displayed)
    *******************************************************************/

	    let targetDay = new Date(year, month, targetdate);

		let first = targetDay.getDate() - targetDay.getDay(); // First day is the day of the month - the day of the week
        let daystring = "";
		let firstDay = new Date(targetDay.setDate(first)).getDate();
		let firstMonth = new Date(targetDay.setDate(first)).getMonth();
		let thisMonth = parseInt(month) - 1;
        let ariamonth = parseInt(month);
		firstMonth ++;

		mainCalendar.innerHTML = weekCal.innerHTML;
	    //fill the headers
	    if(firstDay >targetdate) {
            //need to fill the start of the week with days from the previous month
	    	calendarStartDate = year + "-";
            calendarStartDate += forceDoubleDigits(firstMonth+1) + "-";
            calendarStartDate += forceDoubleDigits(firstDay);
	    	
            daystring = isMobile ? "Sun<br/>" : "Sunday, ";
		    document.getElementById("weekly-header-sunday").innerHTML =  daystring + firstDay;
            document.getElementById("weekly-Sunday-content").setAttribute("aria-label", firstDay + ", Sunday " + months[ariamonth] + " " + year);
            firstDay == daysInMonth(month-1, year) ? firstDay = 1 : firstDay++;
            if(firstDay == 1) ariamonth++;

            daystring = isMobile ? "Mon<br/>" : "Monday, ";
            document.getElementById("weekly-header-monday").innerHTML =  daystring + firstDay;
            document.getElementById("weekly-Monday-content").setAttribute("aria-label", firstDay + ", Monday " + months[ariamonth] + " " + year);
            firstDay == daysInMonth(month-1, year) ? firstDay = 1 : firstDay++;
            if(firstDay == 1) ariamonth++;

            daystring = isMobile ? "Tue<br/>" : "Tuesday, ";
            document.getElementById("weekly-header-tuesday").innerHTML =  daystring + firstDay;
            document.getElementById("weekly-Tuesday-content").setAttribute("aria-label", firstDay + ", Tuesday " + months[ariamonth] + " " + year);
            firstDay == daysInMonth(month-1, year) ? firstDay = 1 : firstDay++;
            if(firstDay == 1) ariamonth++;

            daystring = isMobile ? "Wed<br/>" : "Wednesday, ";
            document.getElementById("weekly-header-wednesday").innerHTML =  daystring + firstDay;
            document.getElementById("weekly-Wednesday-content").setAttribute("aria-label", firstDay + ", Wednesday " + months[ariamonth] + " " + year);
            firstDay == daysInMonth(month-1, year) ? firstDay = 1 : firstDay++;
            if(firstDay == 1) ariamonth++;

            daystring = isMobile ? "Thu<br/>" : "Thursday, ";
            document.getElementById("weekly-header-thursday").innerHTML =  daystring + firstDay;
            document.getElementById("weekly-Thursday-content").setAttribute("aria-label", firstDay + ", Thursday " + months[ariamonth] + " " + year);
            firstDay == daysInMonth(month-1, year) ? firstDay = 1 : firstDay++;
            if(firstDay == 1) ariamonth++;

            daystring = isMobile ? "Fri<br/>" : "Friday, ";
            document.getElementById("weekly-header-friday").innerHTML =  daystring + firstDay;
            document.getElementById("weekly-Friday-content").setAttribute("aria-label", firstDay + ", Friday " + months[ariamonth] + " " + year);
            firstDay == daysInMonth(month-1, year) ? firstDay = 1 : firstDay++;
            if(firstDay == 1) ariamonth++;

            daystring = isMobile ? "Sat<br/>" : "Saturday, ";
            document.getElementById("weekly-header-saturday").innerHTML =  daystring + firstDay;
            document.getElementById("weekly-Saturday-content").setAttribute("aria-label", firstDay + ", Saturday " + months[ariamonth] + " " + year);

		    calendarEndDate = year + "-";
            calendarEndDate += forceDoubleDigits(ariamonth) + "-";
            calendarEndDate += forceDoubleDigits(firstDay);
		} else {
			calendarStartDate = year + "-";
            calendarStartDate += forceDoubleDigits(firstMonth) + "-";
            calendarStartDate += forceDoubleDigits(firstDay);

            daystring = isMobile ? "Sun<br/>" : "Sunday, ";
			document.getElementById("weekly-header-sunday").innerHTML =  daystring + firstDay;
            document.getElementById("weekly-Sunday-content").setAttribute("aria-label", firstDay + ", Sunday " + months[ariamonth] + " " + year);
            firstDay == daysInMonth(month, year) ? firstDay = 1 : firstDay++;
            if(firstDay == 1) ariamonth++;

            daystring = isMobile ? "Mon<br/>" : "Monday, ";
            document.getElementById("weekly-header-monday").innerHTML =  daystring + firstDay;
            document.getElementById("weekly-Monday-content").setAttribute("aria-label", firstDay + ", Monday " + months[ariamonth] + " " + year);
            firstDay == daysInMonth(month, year) ? firstDay = 1 : firstDay++;
            if(firstDay == 1) ariamonth++;

            daystring = isMobile ? "Tue<br/>" : "Tuesday, ";
            document.getElementById("weekly-header-tuesday").innerHTML =  daystring + firstDay;
            document.getElementById("weekly-Tuesday-content").setAttribute("aria-label", firstDay + ", Tuesday " + months[ariamonth] + " " + year);
            firstDay == daysInMonth(month, year) ? firstDay = 1 : firstDay++;
            if(firstDay == 1) ariamonth++;

            daystring = isMobile ? "Wed<br/>" : "Wednesday, ";
            document.getElementById("weekly-header-wednesday").innerHTML =  daystring + firstDay;
            document.getElementById("weekly-Wednesday-content").setAttribute("aria-label", firstDay + ", Wednesday " + months[ariamonth] + " " + year);
            firstDay == daysInMonth(month, year) ? firstDay = 1 : firstDay++;
            if(firstDay == 1) ariamonth++;

            daystring = isMobile ? "Thu<br/>" : "Thursday, ";
            document.getElementById("weekly-header-thursday").innerHTML =  daystring + firstDay;
            document.getElementById("weekly-Thursday-content").setAttribute("aria-label", firstDay + ", Thursday " + months[ariamonth] + " " + year);
            firstDay == daysInMonth(month, year) ? firstDay = 1 : firstDay++;
            if(firstDay == 1) ariamonth++;

            daystring = isMobile ? "Fri<br/>" : "Friday, ";
            document.getElementById("weekly-header-friday").innerHTML =  daystring + firstDay;
            document.getElementById("weekly-Friday-content").setAttribute("aria-label", firstDay + ", Friday " + months[ariamonth] + " " + year);
            firstDay == daysInMonth(month, year) ? firstDay = 1 : firstDay++;
            if(firstDay == 1) ariamonth++;

            daystring = isMobile ? "Sat<br/>" : "Saturday, ";
            document.getElementById("weekly-header-saturday").innerHTML =  daystring + firstDay;
            document.getElementById("weekly-Saturday-content").setAttribute("aria-label", firstDay + ", Saturday " + months[thisMonth] + " " + year);

		    calendarEndDate = year + "-";
            calendarEndDate += forceDoubleDigits(ariamonth+1) + "-";
            calendarEndDate += forceDoubleDigits(firstDay);
		}

	    populateCalendar();
	}



/* ----------------------------------------
           Daily Calendar Functions
---------------------------------------- */


    
	function showDailyCalendar(year, month, targetdate=1) {
    /*******************************************************************
    * This function generates the layout for the daily calendar and creates 
    * the onClick events that allow you to create a new event by clicking on 
    * an empty field in the calendar
    *
    * input:
    * month: the month the calendar should display
    * year: the year the calendar should display
    * targetdate: the date we want to target (the day containing this date will be displayed)
    *******************************************************************/

	    let targetDay = new Date(year, month, targetdate);
	    let thisMonth = parseInt(month) + 1;

		mainCalendar.innerHTML = dayCal.innerHTML;
	    
        document.getElementById("daily-header").innerHTML = days[targetDay.getDay()] + ", " + targetDay.getDate() + " " + months[targetDay.getMonth()];


        //handle aria label on the date for accessibility
        document.getElementById("daily-content").setAttribute("aria-label", targetdate + ", " + days[targetDay.getDay()] + " " + months[targetDay.getMonth()] + " " + year);

        //set up the variables needed for tha ajax get events call
        calendarStartDate = year + "-";
        calendarStartDate += forceDoubleDigits(thisMonth) + "-";
        calendarStartDate += forceDoubleDigits(targetDay.getDate());
        calendarEndDate = year + "-";
        calendarEndDate += forceDoubleDigits(thisMonth) + "-";
        calendarEndDate += forceDoubleDigits(targetDay.getDate());

	    populateCalendar();
	}



/* ----------------------------------------
            Form Validation Code
---------------------------------------- */
    function validateRequired(control){
    /*******************************************************************
    * This function validates a form control which is required
    *
    * input:
    * control: a reference to the control to validate
    *
    * returns: true or false depending on whether it is valid
    *******************************************************************/

        if((control.value.length == 0 || control.selectedIndex == 0 )){
            control.className = ' boc-invalid';
            document.getElementById(control.id + "-msg").innerHTML = "This field cannot be blank";
            return false;
        } else {
            control.className = ' boc-valid';
            document.getElementById(control.id + "-msg").innerHTML = "correct";
            return true;
        }
    }



    function validateDate(control)
    /*******************************************************************
    * This function validates a form control which is a date and
    * ensures it contains a valid date
    *
    * input:
    * control: a reference to the control to validate
    *
    * returns: true or false depending on whether it is valid
    *******************************************************************/
    {
        var dateString = control.value;
        var isValid = true;
        // First check for the pattern
        if(!/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(dateString)){
            isValid = false;
        }

        // Parse the date parts to integers
        var parts = dateString.split("-");
        var day = parseInt(parts[2], 10);
        var month = parseInt(parts[1], 10);
        var year = parseInt(parts[0], 10);
        var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
        var thisYear = new Date().getFullYear();
        // Check the ranges of month and year
        if(year < thisYear - 150 || year > thisYear || month == 0 || month > 12){
            control.className = ' boc-invalid';
            document.getElementById(control.id + "-msg").innerHTML = "birth date must be between " + (thisYear - 150) + " and " + thisYear;
            return false;
        } else {
            // Adjust for leap years
            if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)){ monthLength[1] = 29; }
            // Check the range of the day
            if(day <= 0 && day > monthLength[month - 1]){
                isValid = false;
            }
        }

        if (isValid == false ) {
            control.className = ' boc-invalid';
            document.getElementById(control.id + "-msg").innerHTML = "Please enter a valid date";
            return false;
        } else {
            control.className = ' boc-valid';
            document.getElementById(control.id + "-msg").innerHTML = "correct";
            return true;
        }
    }




    function validateEmail(control){
    /*******************************************************************
    * This function validates a form control which is an email and ensures it
    * contains a valid email address
    *
    * input:
    * control: a reference to the control to validate
    *
    * returns: true or false depending on whether it is valid
    *******************************************************************/

        //regular expression for an email address
        var emailRegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if(!emailRegExp.test(control.value)){
            control.className = ' boc-invalid';
            document.getElementById(control.id + "-msg").innerHTML = "Email must be a valid email";
            return false;
        } else {
            control.className = ' boc-valid';
            document.getElementById(control.id + "-msg").innerHTML = "correct";
            return true;
        }
    }


    function validateForm(currForm){
    /*******************************************************************
    * This function validates a form in it's entirity. Each control on the form
    * is scanned for data- elements which indicate what type of validation
    * each form element may require
    *
    * input:
    * currForm: a reference to the form to validate
    *
    * returns: true or false depending on whether it is valid
    *******************************************************************/
        var validates = true;
        var validateString = "";
        var oneRadioChecked = false;
        var oneCheckChecked = false;

        for(var loopCount = 0; loopCount < currForm.elements.length; loopCount++) {
            if(currForm.elements[loopCount].getAttribute('data-validate') == 'true') {

                currForm.elements[loopCount].className=("");

                validateString = currForm.elements[loopCount].getAttribute('data-validation-type');
                if(validateString.search("required") != -1){
                    if(!validateRequired(currForm.elements[loopCount])) { validates = false; }
                }
                if(validateString.search("file") != -1){
                    if(!validateFile(currForm.elements[loopCount])) { validates = false; }
                }
                if(validateString.search("date") != -1){
                    if(!validateDate(currForm.elements[loopCount])) { validates = false; }
                }
                if(validateString.search("email") != -1){
                    if(!validateEmail(currForm.elements[loopCount])) { validates = false; }
                }
                if(validateString.search("optional") != -1){
                    if(!validateOptional(currForm.elements[loopCount])) { validates = false; }
                }
                if(validateString.search("radio") != -1){
                    if(!oneRadioChecked) {
                        if(!validateBoxes(currForm.elements[loopCount])) { 
                            validates = false; 
                        } else {
                            oneRadioChecked = true;
                        }
                    }
                }
                if(validateString.search("checkbox") != -1){
                    if(!oneCheckChecked) {
                        if(!validateBoxes(currForm.elements[loopCount])) { 
                            validates = false; 
                        } else {
                            oneCheckChecked = true;
                        }
                    }
                }
                if(validateString.search("captcha") != -1){
                    if(!validateCaptcha(currForm.elements[loopCount])) { validates = false; }
                }
            }
        }
        return validates;
    }