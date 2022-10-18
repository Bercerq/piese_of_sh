

import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import SettingsPage from "../screens/settings/SettingsPage";
import AnalyticsPage from "../screens/analytics/AnalyticsPage";
import AdvaultPage from "../screens/advault/AdvaultPage";
import CreativeFeedPage from "../screens/creativeFeeds/CreativeFeedPage";
import SegmentsPage from "../screens/segments/SegmentsPage";
import ListsPage from "../screens/lists/ListsPage";
import DealsPage from "../screens/deals/DealsPage";
import UsersPage from "../screens/users/UsersPage";
import AdSlotPage from "../screens/publisheradslots/PublisherAdSlotPage";
import AdqueuePage from "../screens/adqueue/AdqueuePage";
import { ScopeDataContextType } from "../../../models/Common"
import ScopeDataContext from "../context/ScopeDataContext";
import ErrorContainer from "../../UI/ErrorContainer";
import AlertsPage from "../screens/alerts/AlertsPage";
import ReportsPage from "../screens/reports/ReportsPage";
import ReportTemplatesPage from "../screens/reportTemplates/ReportTemplatesPage";
import PublisherDealsPage from "../screens/publisherDeals/PublisherDealsPage";
import PublisherReportsPage from "../screens/publisher/reports/PublisherReportsPage";
import PublisherReportTemplatesPage from "../screens/publisher/reportTemplates/PublisherReportTemplatesPage"
import ChangelogPage from "../screens/changelog/ChangelogPage";

const Page = () => {
  let { page }: any = useParams();
  let { loadError } = useContext<ScopeDataContextType>(ScopeDataContext);

  if (loadError.error) {
    return <ErrorContainer message={loadError.message} />;
  } else {
    switch (page) {
      case "settings": return <SettingsPage />
      case "analytics": return <AnalyticsPage />
      case "advault": return <AdvaultPage />
      case "segments": return <SegmentsPage />
      case "lists": return <ListsPage />
      case "deals": return <DealsPage />
      case "publisherdeals": return <PublisherDealsPage />
      case "adslottags" : return <AdSlotPage />
      case "reports": return <ReportsPage />
      case "publisherreports": return <PublisherReportsPage/>
      case "report-templates": return <ReportTemplatesPage />
      case "publisherreporttemplates": return <PublisherReportTemplatesPage/>
      case "data-feeds" : return <CreativeFeedPage />
      case "users": return <UsersPage />
      case "adqueue": return <AdqueuePage />
      case "alerts": return <AlertsPage />
      case "changelog": return <ChangelogPage />
      default: return <ErrorContainer message="Page not found" />;
    }
  }
}
export default Page;
