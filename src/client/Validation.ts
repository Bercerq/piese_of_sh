import validator from "validator";
import { DateRange, ValidationError } from "./schemas";

declare var ActiveXObject: any;

export const required = (value: string | string[]): ValidationError => {
  let condition: boolean;
  if (value instanceof Array) {
    condition = value.length === 0;
  } else {
    condition = value.trim() === "";
  }

  if (condition) {
    return {
      error: true,
      message: "Please fill out this field."
    }
  } else {
    return {
      error: false,
      message: ""
    }
  }
};

export const email = (email: string): ValidationError => {
  if (email === "") {
    return {
      error: true,
      message: "Please fill out this field."
    };
  } else if (!validator.isEmail(email)) {
    return {
      error: true,
      message: "Incorrect email format."
    };
  } else {
    return {
      error: false,
      message: ""
    };
  }
};

export const length = (value: string, minLength: number, required: boolean): ValidationError => {
  const requiredError = {
    error: true,
    message: "Please fill out this field."
  };

  const minLengthError = {
    error: true,
    message: `Minimum of ${minLength} characters`
  };

  if (required) {
    if (value === "") {
      return requiredError;
    } else {
      if (value.length < minLength) {
        return minLengthError;
      }
    }
  } else {
    if (value.length < minLength) {
      return minLengthError;
    }
  }

  return { error: false, message: "" };
}

export const token = (value: string, length: number, delta: number): ValidationError => {
  const wrongLengthError = {
    error: true,
    message: "Please enter the 6 digit number from app."
  };
  const wrongDeltaError = {
    error: true,
    message: "The token you entered was invalid."
  };

  if (value.length != 6) {
    return wrongLengthError;
  } else if (delta < -2 || delta > 0) {
    return wrongDeltaError;
  }

  return {error: false, message: ""}
}

export const matchPassword = (password: string, confirmPassword: string) => {
  if (password !== confirmPassword) {
    return {
      error: true,
      message: "The two passwords should match."
    }
  }
  return { error: false, message: "" };
}

export const domain = (domain: string, required: boolean): ValidationError => {
  const validDomain = (domain || "").indexOf("www.") !== 0 && /^[a-zA-Z0-9][a-zA-Z0-9-_]{0,61}[a-zA-Z0-9]{0,1}\.([a-zA-Z]{1,15}|[a-zA-Z0-9-]{1,30}\.[a-zA-Z]{2,3})$/.test(domain);
  let error = false;
  let message = "";

  if (required) {
    if (domain === "") {
      error = true;
      message = "Please fill out this field."
    } else {
      if (!validDomain) {
        error = true;
        message = "Not a valid domain name.";
      }
    }
  } else {
    if (!validDomain) {
      error = true;
      message = "Not a valid domain name.";
    }
  }

  return { error, message };
}

export const native = (input: HTMLInputElement): ValidationError => {
  const error = !input.checkValidity();
  const message = input.validationMessage;
  return { error, message };
}

export const coordinates = (location: string): ValidationError => {
  const coordinates = location.split(",");
  const isValid = coordinates.length === 2 && coordinates.every((c) => { return !isNaN(parseFloat(c)); });
  return { error: !isValid, message: isValid ? "" : "Incorrect format" };
}

export const limitBid = (value: number, maxBidPrice: number): ValidationError => {
  if (!value) {
    return { error: true, message: "Please fill out this field." };
  } else if (value > maxBidPrice) {
    return { error: true, message: `Value must be less than or equal to ${maxBidPrice}` };
  } else {
    return { error: false, message: "" };
  }
}

export const numberInRange = (value: number, min : number, max : number): ValidationError => {

  if (isNaN(value) || value < min ||  value >max ) {
    return {
      error: true,
      message: `Please fill in a number between ${min} and ${max}`
    }
  } else {
    return {
      error: false,
      message: ""
    }
  }
};

export const url = (value: string, required: boolean) => {
  const requiredError = {
    error: true,
    message: "Please fill out this field."
  };

  const urlError = {
    error: true,
    message: "http(s):// is missing, or the input is not a valid url."
  }

  const options = { protocols: ["http", "https"], require_protocol: true };

  if (required) {
    if ((value || "").trim() === "") {
      return requiredError;
    } else {
      if (!validator.isURL(value, options)) {
        return urlError;
      }
    }
  } else {
    if (value !== "" && !validator.isURL(value, options)) {
      return urlError;
    }
  }

  return { error: false, message: "" };
}

export const vastTag = (value: string) => {
  const options = { protocols: ["http", "https"], require_protocol: true };
  const validUrl = validator.isURL(value, options);
  const validXml = isValidXml(value);
  if (validUrl || validXml) {
    return { error: false, message: "" };
  } else {
    return { error: true, message: "Please fill in valid url or valid xml" }
  }
}

export const daterange = (daterange: DateRange) => {
  return (!daterange.startDate || !daterange.endDate) ? { error: true, message: "Please fill out this field." } : { error: false, message: "" };
}

function isValidXml(txt: string): boolean {
  var xt = "",
    h3OK = 1

  function checkErrorXML(x) {
    xt = ""
    h3OK = 1
    checkXML(x)
  }

  function checkXML(n) {
    var l, i, nam
    nam = n.nodeName
    if (nam == "h3") {
      if (h3OK == 0) {
        return;
      }
      h3OK = 0
    }
    if (nam == "#text") {
      xt = xt + n.nodeValue + "\n"
    }
    l = n.childNodes.length
    for (i = 0; i < l; i++) {
      checkXML(n.childNodes[i])
    }
  }

  function validateXML(txt) {
    // code for IE
    if ((window as any).ActiveXObject) {
      var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async = false;
      xmlDoc.loadXML(txt);
      if (xmlDoc.parseError.errorCode != 0) {
        return false;
      } else {
        return true;
      }
    }
    // code for Mozilla, Firefox, Opera, etc.
    else if (document.implementation.createDocument) {
      try {
        var parser = new DOMParser();
        var xmlDoc: any = parser.parseFromString(txt, "application/xml");
      } catch (err) {
        return false;
      }

      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        checkErrorXML(xmlDoc.getElementsByTagName("parsererror")[0]);
        return xt == "";
      } else {
        return true;
      }
    } else {
      return true;
    }
  }
  return validateXML(txt);
}