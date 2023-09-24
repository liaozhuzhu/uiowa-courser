const { ECDH } = require("crypto");
const { randomStringToHash24Bits } = require("./utils/helpers");

const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs').promises;

// Connection URL
const url = 'mongodb+srv://user:2Sz4X5YoPNTsy75r@cluster0.jb62ody.mongodb.net/?retryWrites=true&w=majority';

const client = new MongoClient(url, {
    serverApi: {
      version: ServerApiVersion.v1,
      deprecationErrors: true,
    }
});

class scheduleBuilder {
    constructor(){
        this.dbStuff = null;
    }

    getRecommendations = async (remainingCourses) => {
        console.log('schedule');
        // resolve with grouping
        // pick 5, 2 gen ed, 3 cores
        const groups = {gened: {}, core:[]};
        const remainingGeneds = remainingCourses.gened;
        for (requirement in remainingGeneds){
            const group = await this.getGenEdCoursesByRequirement(requirement, null); // mongo
            groupings.gened[requirement] = group;
        }
        const remainingCores = remainingCourses.cores;
        for (element in remainingCores){
            if (typeof element === "string") {
                groupings.core.push = [element];
            }
            else {
                if (element[element.length-1] === "RANGE"){
                    const subject = element[0].slice(0, rec.indexOf(":"));
                    const group = await this.courseswithinrange(element[0], element[1], subject); // mongo
                    groupings.core.push(group);
                }
                else{
                    groupings.core.push(element);
                }
            }
        }
        const recs = []
        const i = 0;
        for (group in groups.gened){
            if (i >= 2){
                break;
            }
            recs.push(group[0]);
            i++;
        }
        const j = 0;
        for (group in groups.core){
            if (i >= 3){
                break;
            }
            recs.push(group[0]);
            i++;
        }
        const finalrecs = []
        for (i = 0; i < recs.length; i++){
            const thingtopush = await this.getCourseInfo(recs[i])
            finalrecs.push(thingtopush);
        }
        return finalrecs;
    }
    getGenEdCoursesByRequirement = async (requirement, session=20235) => {
        try {
          await client.connect();
          console.log("Connected to MongoDB!");
      
          const db = await client.db('data');
          const collection = await db.collection('GenEdClasses');
          
          const documents = await collection.find({ 
            "requirementFilled": { "$regex": requirement, "$options": "i" } ,
            "term": session
          }).toArray();
      
          console.log(documents);
          return documents
          
        } catch (error) {
          console.error('Error:', error);
        } finally {
          await client.close();
        }
      }
      
    // Retrieves a course from the database based on a specified course number + subject
    getCourseInfo = async (rec) => {
        const subject = rec.slice(0, rec.indexOf(":"));
        const courseNumber = rec.slice(rec.indexOf(":")+1, rec.length);
        const session = 20235;
        try {
          await client.connect();
          console.log("Connected to MongoDB!");
      
          const db = await client.db('data');
          const collection = await db.collection('CoreClasses');
          
          // Case insensitive search
          const courses = await collection.find({
            course: Number(courseNumber),
            session: session,
            subject: subject
          }).toArray();
      
          console.log(courses);
          return courses;
          
        } catch (error) {
          console.error('Error:', error);
        } finally {
          await client.close();
        }
      }

    // Retrieves a list of courses within a specified range from the database.
    coursesWithinRange = async (min, max, session=20235, subject) => {
        try {
          await client.connect();
          console.log("Connected to MongoDB!");
      
          const db = await client.db('data');
          const collection = await db.collection('CoreClasses');
          
          // Case insensitive search
          const coursesInRange = await collection.find({
            course: {
              $gte: min,
              $lte: max
            },
            session: session,
            subject: subject
          }).toArray();
      
          console.log(coursesInRange);
          return coursesInRange
          
        } catch (error) {
          console.error('Error:', error);
        } finally {
          await client.close();
        }
      }
}

module.exports = scheduleBuilder;