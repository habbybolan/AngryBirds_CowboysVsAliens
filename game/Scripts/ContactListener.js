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
        // If contact between 2 non-boundary game objects
        if (bodyUserDataA && bodyUserDataB)
            GameObject.startContact(bodyUserDataA, bodyUserDataB)
        // otherwise, check if contact with boundary happened
        else {
            if (bodyUserDataA)
                bodyUserDataA.contactWithBoundary()
            else if (bodyUserDataB)
                bodyUserDataB.contactWithBoundary() 
        }
      }
    
    EndContact(contact) {
        
        // TODO if needed?
    }
}