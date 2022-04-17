import Physics from "../../common/libs/Physics.js";
import GameObject from "./GameObject.js";

/*
* Listener for calling collision events between non-boundary GameObjects
*/
export default class ContactListener extends Physics.Listener {
    
    BeginContact(contact) {
  
        //check if fixture A and B is not a boundary
        let bodyUserDataA = contact.GetFixtureA().GetBody().GetUserData()
        let bodyUserDataB = contact.GetFixtureB().GetBody().GetUserData()
        if (bodyUserDataA && bodyUserDataB)
            GameObject.startContact(bodyUserDataA, bodyUserDataB)
      }
    
    EndContact(contact) {
        // TODO: End contact logic?
    }
}