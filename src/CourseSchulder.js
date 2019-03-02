
/* Static Degree requirement */
var required_class = [["130","140","160"],["182"],["215"],["310"],["321"],["322"],["382"],["411","412"],["421"]]
var bottomlevelCourse = [] 
var toplevelCourse = []
// Elective : 2 course required (BS and BA)

// Cap : 4 -5 300 level or higher (BS)



/* Data for hashing static data */ 
var graph = require("./generate_graph");
var class_hash = {}
var class_rev_hash = {}
// TODO : add semester once it is in the data 
for (i=0; i<graph.length; i++) {
    prereqs = graph[i].prev;
    for (j=0; j<prereqs.length;j++) {
        prereqs[j] = prereqs[j].split("; ");
    }
    // console.log(graph[i].id);
    // console.log(prereqs);
    // Add to prerequisite of class
    class_hash[graph[i].id] = {"prereq":graph[i].prev};
    // Add to postrequisite of class
    if (!(graph[i].id in class_rev_hash)) {
        class_rev_hash[graph[i].id] = {"postreq":[]}
    }
    for (j=0; j<prereqs.length; j++) {
        prereq_class = prereqs[j];
        if (prereq_class in class_rev_hash) {
            class_rev_hash[prereq_class]["postreq"].push(graph[i].id);
        } else {
            class_rev_hash[prereq_class] = {"postreq":[graph[i].id]}
        }
    }

}
// console.log("prereq for 182",class_hash["182"]["prereq"])
// console.log("class 182 is prereq",class_rev_hash["182"]["postreq"])
// console.log(class_rev_hash["310"])

// Add all toplevel course : class with no postrequisite
Object.keys(class_rev_hash).forEach(function(course,index) {
    console.log(course)
    console.log(class_rev_hash[course]["postreq"])
    if (class_rev_hash[course]["postreq"] == "") {
        toplevelCourse.push(course);
    }
});

// // Add all bottomlevel course : class with not prerequisite
// Object.keys(class_hash).forEach(function(course,index) {
//     if (class_hash[course]["prereq"] == "") {
//         bottomlevelCourse.push(course)
//     }
// });
// console.log("bottomlevel Course:",bottomlevelCourse)
console.log("toplevel Course:",toplevelCourse)





function processData() {
    //TODO save hastable of class : {"prereq":list_classes}
}

// Input are list of tuple(class and term)
function valid(list_class) {
    var classes  = {};
    for (i=0; i<list_class.length; i++) {
        var classname = list_class[i][0];
        var sem = list_class[i][1];
        classes[classname] = sem;
    }
    //TODO : create hashtable datastructure.
    // For each class we put in
    for (i=0; i<list_class.length; i++) {
        var classname = list_class[i][0];
        var sem = list_class[i][1];
        var prereqs = class_hash[classname]['prereq'];
        console.log(classname, sem, prereqs);
        if (prereqs[0]!="") {
            // Check if all prereq has been valid
            for (j=0; j<prereqs.length; j++) {
                prereq = prereqs[j]
                // Check if any cop-req is in our class
                flag = false;
                for (k=0; k<prereq.length; k++) {
                    // If prereq exist in classes and is before current class.
                    if (prereq[k] in classes && classes[prereq[k]]<sem) {
                        flag = true;
                    }
                }
                if (!flag) {
                    return false;
                }
            }
        }
    }
    return true;
}

/* Helper for checking if course is requirement */
function isitRequirement(course) {
    for (i=0;required_class.length;i++) {
        courseSet = required_class[i];
        if (courseSet.includes(course)) return true;
    }
    return false;
}

function recommendation(list_class,this_term) {
    /*  ------ Process hard_req, soft_req, elective ------ */
    var courses = {};
    // Add hard_req
    for (i=0; i<list_class; i++) {
        course = list_class[i][0];
        sem = list_class[i][1];
        courses[course] = {"type":"hardreq","sem":sem}
    }
    // Add soft_req
    // console.log(required_class)
    for (i=0;i<required_class.length;i++) {
        courseSet = required_class[i];
        nonetaken = true;
        for (j=0; j<courseSet.length;j++) {
            course = courseSet[j]
            if (course in courses) nonetaken = false;
            if (!(course in courses)) {
                courses[course] = {"type":"softreq","upperbound":8,"lowerbound":parseInt(this_term)}
            }
        }
        // None of the corequisite is taken any become soft requirement
        if (nonetaken) {
            for (j=0; j<courseSet.length;j++) {
                course = courseSet[j]
                if (!(course in courses)) {
                    courses[course] = {"type":"softreq","upperbound":8,"lowerbound":parseInt(this_term)}
                }
            }
        // At least one is taken : other classes are elective
        } else {
            for (j=0; j<courseSet.length;j++) {
                course = courseSet[j]
                if (!(course in courses)) {
                    courses[course] = {"type":"elective","upperbound":8,"lowerbound":parseInt(this_term)}
                }
            }
        }
    }
    // Add elective
    Object.keys(class_hash).forEach(function(course,index) {
        if (!(course in courses)) {
            courses[course] = {"type":"elective","upperbound":8,"lowerbound":parseInt(this_term)}
        }
    });

    /* ----------- Algorithm start ----------- */

    var class_range = {};
    var class_fixed = {};
    // Fixed classes : inmutable 
    for (i=0; i<list_class.length;i++) {
        class_fixed[list_class[i][0]] = list_class[i][1]
    }
    class_fixed[changed_class] = this_term;

    // Run BFS : should work fine unless there is cycle which doesn't make sense(
    // If cycle ever occurs check cycle checker for it)
    queue = [];
    queue.unshift(changed_class);

    while (queue) {
        node = queue.pop();
        class_ = node[0];
        term = node[1]
        // add classes into class_range if not fixed then get is prereqs. 
        if (!(class_ in class_fixed)) {
            if (class_ in class_range) {
                class_range[class_][1] = term
            } else {
                class_range[class_] = [this_term,term]
            }
            // Get all prereqs put it in que 
            prereqs = class_hash[class_]["prereq"]
            for (i=0; i < prereqs.length; i++) {
                prereq = prereqs[i]
                for (j=0; j < prereq.length;j++) {
                    single_prereq = prereq[j]
                    queue
                }
            }
        }
    }
}

// input1 = [['130',0],['182',1]]
// console.log(valid(input1) + "should be True")
// input2 = [["130",0],["182",0]]
// console.log(valid(input2) + "should be False")
// input3 = [["130",0],["182",1],["215",2],["321",3]]
// console.log(valid(input3) + "should be False")
// input4 = [["130",0],["182",1],["220",1],["215",2],["321",3]]
// console.log(valid(input4) + "should be True")



// input4 = [["130",0],["182",1],["220",1],["215",2],["321",3]]
// console.log(recommendation(input4,4) + "should be True")