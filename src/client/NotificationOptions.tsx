import * as React from "react";
import NotificationSystem from "react-notification-system";
import FontIcon from "../components/UI/FontIcon";

export const success = (title: string | JSX.Element, dismissible: boolean = false, onRemove?: () => void): NotificationSystem.Notification => {
  if (dismissible) {
    return {
      title: title,
      level: 'success',
      autoDismiss: 0,
      children: (
        <FontIcon name="check-circle" />
      ),
      onRemove: () => {
        if(onRemove) onRemove();
      }
    }
  } else {
    return {
      title: title,
      level: 'success',
      autoDismiss: 3,
      dismissible: false,
      children: (
        <FontIcon name="check-circle" />
      ),
      onRemove: () => {
        if(onRemove) onRemove();
      }
    }
  }
}

export const error = (title: string | JSX.Element): NotificationSystem.Notification => {
  return {
    title: title,
    level: 'error',
    autoDismiss: 0,
    children: (
      <FontIcon name="times-circle" />
    )
  }
}

export const warning = (title: string | JSX.Element): NotificationSystem.Notification => {
  return {
    title: title,
    level: 'warning',
    autoDismiss: 0,
    children: (
      <FontIcon name="exclamation-circle" />
    )
  }
}

export const info = (title: string | JSX.Element): NotificationSystem.Notification => {
  return {
    title: title,
    level: 'info',
    autoDismiss: 3,
    dismissible: false
  }
}