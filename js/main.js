/* feather:false */

import {Admin} from "./admin.js";
import {Registration, Authorization, Settings} from "./user.js";
import {Note, Categories} from "./notes.js";


new Admin();
new Registration().addUser(
    {
        id:1, login:"admin", pass:"123", role:"admin",
        permissions: { canAdd: true, canEdit: true, canDelete: true },
    });
new Authorization();
new Note();
new Categories();
new Settings();


























  