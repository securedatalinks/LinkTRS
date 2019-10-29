/*eslint-disable */
import React from "react";

import validator from 'validator';

function validateForm(check, data) {
    const {
      wireframe,
      accMargin,
      term,
      minMargin,
      notionalVal,
      assetVal,
      interestPercent,
      totalLink
    } = data;

    var errors = {
        hasError: false,
        errorsObj: {}
    }


    //console.log(validator.isEmail(email))

    let Validation = {
        // wireframe: {
        //     Validate: [{
        //         condition: !wireframe.length,
        //         message: " Please Specify The Wire Frame",
        //     }, {
        //         condition: /\d/.test(wireframe) || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(wireframe),
        //         message: " First Name Can Not Contain Numbers Or Any Special Characters . ",
        //     }
        //     ],
        //     elem: "wireframe"
        // },

        // accMargin: {
        //     Validate: [{
        //         condition: !accMargin.length,
        //         message: " Please enter a valid acceptance margin",
        //     }],
        //     elem: "accMargin"
        // },


        term: {
            Validate: [{
                condition: !term.length,
                message: " Please Provide A valid term length",
            }],
            elem: "term"
        },

        minMargin: {
            Validate: [{
                condition: !minMargin.length,
                message: " Field cannot be empty ",
            }],
            elem: "minMargin"
        },

        interestPercent: {
            Validate: [{
                condition: !interestPercent.length,
                message: " Field cannot be empty ",
            }],
            elem: "interestPercent"
        },


        totalLink: {
            Validate: [{
                condition: !totalLink.length,
                message: " Field cannot be empty ",
            }],
            elem: "totalLink"
        },

    }

    if (check === "all") {
        for (var i in Validation) {
            var conArray = Validation[i].Validate;
            errors.errorsObj[Validation[i].elem] = { message: [] }
            for (var j = 0; j < conArray.length; j++) {
                if (conArray[j].condition) {
                    errors.hasError = true
                    errors.errorsObj[Validation[i].elem].message.push(conArray[j].message)
                }
            }
            if (!errors.errorsObj[Validation[i].elem].message.length) {
                delete errors.errorsObj[Validation[i].elem];
            }
        }
    }

    return Object.keys(errors).length > 1 ? errors : {
        hasError: false
    }
}




export { validateForm };
