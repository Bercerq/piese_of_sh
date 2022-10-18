export const getJudgementColor = (judgement) => {
  switch (judgement) {
    case "GOOD": return "green";
    case "OKAY": return "#ffc300";
    case "NOT_OKAY": return "#ff8333";
    case "BAD": return "red";
  }
}

export const getJudgementClass = (judgement) => {
  switch (judgement) {
    case "GOOD": return "green";
    case "OKAY": return "yellow";
    case "NOT_OKAY": return "orange";
    case "BAD": return "red";
    case "UNKNOWN": return "unknown";
  }
}