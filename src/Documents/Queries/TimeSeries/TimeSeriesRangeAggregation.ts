import { ClassConstructor } from "../../../Types";
import { TypedTimeSeriesRangeAggregation } from "./TypedTimeSeriesRangeAggregation";
import { TimeSeriesValuesHelper } from "../../Session/TimeSeries/TimeSeriesValuesHelper";

export class TimeSeriesRangeAggregation {
    public count: number[];
    public max: number[];
    public min: number[];
    public last: number[];
    public first: number[];
    public average: number[];
    public sum: number[];
    public to: Date;
    public from: Date;

    public asTypedEntry<T extends object>(clazz: ClassConstructor<T>): TypedTimeSeriesRangeAggregation<T> {
        const typedEntry = new TypedTimeSeriesRangeAggregation<T>();

        typedEntry.from = this.from;
        typedEntry.to = this.to;
        typedEntry.min = this.min ? TimeSeriesValuesHelper.setFields(clazz, this.min, true) : null;
        typedEntry.max = this.max ? TimeSeriesValuesHelper.setFields(clazz, this.max, true) : null;
        typedEntry.first = this.first ? TimeSeriesValuesHelper.setFields(clazz, this.first, true) : null;
        typedEntry.last = this.last ? TimeSeriesValuesHelper.setFields(clazz, this.last, true) : null;
        typedEntry.sum = this.sum ? TimeSeriesValuesHelper.setFields(clazz, this.sum, true) : null;
        typedEntry.count = this.count ? TimeSeriesValuesHelper.setFields(clazz, this.count, true) : null;
        typedEntry.average = this.average ? TimeSeriesValuesHelper.setFields(clazz, this.average, true) : null;

        return typedEntry;
    }
}