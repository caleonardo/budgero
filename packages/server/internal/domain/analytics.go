package domain

// AnalyticsGranularity controls how the analytics endpoints bucket
// timestamps. Valid: "daily", "weekly", "monthly".
type AnalyticsGranularity string

// Granularity values accepted by the analytics endpoints.
const (
	AnalyticsGranularityDaily   AnalyticsGranularity = "daily"
	AnalyticsGranularityWeekly  AnalyticsGranularity = "weekly"
	AnalyticsGranularityMonthly AnalyticsGranularity = "monthly"
)

// IsValid reports whether g is a known granularity.
func (g AnalyticsGranularity) IsValid() bool {
	switch g {
	case AnalyticsGranularityDaily, AnalyticsGranularityWeekly, AnalyticsGranularityMonthly:
		return true
	}
	return false
}

// TimeSeriesPoint is one bucketed metric value.
type TimeSeriesPoint struct {
	Period string `json:"period"`
	Count  int64  `json:"count"`
}
