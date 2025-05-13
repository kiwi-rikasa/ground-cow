def check_suppression(
    currTime: int, currSeverity: str, prevTime: int, prevSeverity: str, interval: int
) -> bool:
    """
    Check if the alert should be suppressed based on the current and last unsuppressed event.

    :param currTime: The current alert time.
    :param currSeverity: The current alert severity.
    :param prevTime: The previous alert time.
    :param prevSeverity: The previous alert severity.
    :param interval: The suppression interval in seconds.

    :return: True if the alert should be suppressed, False otherwise.
    """

    within_interval = is_within_interval(currTime, prevTime, interval)
    not_more_severe = not is_more_severe(currSeverity, prevSeverity)

    # Suppress if within interval and not more severe
    return within_interval and not_more_severe


def is_more_severe(currSeverity: str, prevSeverity: str) -> bool:
    """
    Check if the current alert severity is more severe than the previous one.

    :param currSeverity: The current alert severity.
    :param prevSeverity: The previous alert severity.

    :return: True if the current alert is more severe, False otherwise.
    """
    levels = ["NA", "L1", "L2"]

    return levels.index(currSeverity) > levels.index(prevSeverity)


def is_within_interval(currTime: int, prevTime: int, interval: int) -> bool:
    """
    Check if the current alert time is within the suppression interval of the previous alert.

    :param currTime: The current alert time.
    :param prevTime: The previous alert time.
    :param interval: The suppression interval in seconds.

    :return: True if within the interval, False otherwise.
    """
    return (currTime - prevTime) <= interval
