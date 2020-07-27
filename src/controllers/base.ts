// errors
import errors from '../helpers/errors';
// services
import Users from '../services/Users';
import Groups from '../services/Groups';
import Forums from '../services/Forums';
import Catalog from '../services/Catalog';
import UserReferral from "../services/User-Referral";
import Games from '../services/Games';
import Support from '../services/Support';
import Staff from '../services/Staff';
// custom libraries
import * as xss from 'xss';
import * as moment from 'moment';
/**
 * Controller base class
 */
export default class ControllerBase extends errors {
    public Users: Users;
    public Groups: Groups;
    public Forums: Forums;
    public Catalog: Catalog;
    public UserReferral: UserReferral;
    public Games: Games;
    public Support: Support;
    public Staff: Staff;
    public xss = xss;
    public moment = moment;
    constructor(data?: {cookie?: string}) {
        super();
        this.Users = new Users(data);
        this.Groups = new Groups(data);
        this.Forums = new Forums(data);
        this.Catalog = new Catalog(data);
        this.UserReferral = new UserReferral(data);
        this.Games = new Games(data);
        this.Support = new Support(data);
        this.Staff = new Staff(data);
    }
}