
export class Now {
  private readonly now: Date

  constructor(time?: string | number | Date) {
    this.now = new Date(time ?? Date.now())
  }

  /**
   * Sets the time of the current instance by adding the specified number of seconds.
   *
   * @param seconds - The number of seconds to add to the current time.
   * @returns The updated time in seconds.
   */
  public addSeconds(seconds: number) {
    this.now.setTime(this.now.getTime() + seconds * 1_000)
    return this.now.getTime() / 1_000
  }

  /**
   * Adds the specified number of minutes to the current time by converting minutes to seconds and invoking the 'addSeconds' method.
   *
   * @param minutes - The number of minutes to add to the current time.
   * @returns The updated time in seconds after adding the converted minutes.
   */
  public addMinutes(minutes: number) {
    return this.addSeconds(minutes * 60)
  }

  /**
   * Adds the specified number of hours to the current time by converting hours to minutes and invoking the 'addMinutes' method.
   *
   * @param hours - The number of hours to add to the current time.
   * @returns The updated time in seconds after adding the converted hours.
   */
  public addHours(hours: number) {
    return this.addMinutes(hours * 60)
  }

  /**
   * Adds the specified number of days to the current time by converting days to hours and invoking the 'addHours' method.
   *
   * @param days - The number of days to add to the current time.
   * @returns The updated time in seconds after adding the converted days.
   **/
  public addDays(days: number) {
    return this.addHours(days * 24)
  }
}

/**
 * Creates a new instance of the 'Now' class with the specified time.
 *
 * @param time - Optional. The time to initialize the 'Now' instance. Can be a string, number, or Date object.
 * @returns A new instance of the 'Now' class.
 */
export function now(time?: string | number | Date) {
  return new Now(time)
}
