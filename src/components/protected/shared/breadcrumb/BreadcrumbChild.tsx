import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { BreadcrumbItem, BreadcrumbDropdownItem, ScopeType, PageType, BreadcrumbType } from "../../../../client/schemas";
import { AppUser } from "../../../../models/AppUser";
import Loader from "../../../UI/Loader";

const BreadcrumbLabel = (props: { item: BreadcrumbItem; user: AppUser; onClick: (e) => void }) => {
  const readonly = props.user.isRootAdmin ? props.item.parent === -1 && props.item.current && !props.item.type : props.item.parent === -1 && props.item.current;
  if (readonly) {
    return <span className="current">{props.item.label.toString()}</span>;
  } else if (props.item.active) {
    const className = props.item.current ? "current" : null;
    return <a className={className} href="" onClick={props.onClick}>{props.item.label}</a>
  } else {
    return <Link to={props.item.href}>{props.item.label}</Link>
  }
}

interface BreadcrumbChildProps {
  user: AppUser;
  item: BreadcrumbItem;
  dropdownItems: BreadcrumbDropdownItem[];
  open: boolean;
  loading: boolean;
  page: PageType;
  scope: ScopeType;
  onClick: () => void;
  itemClick: (href: string) => void;
  outsideClick: () => void;
}

interface BreadcrumbChildState {
  searchValue: string;
  searchResults: BreadcrumbDropdownItem[];
  cursor: number;
}

export default class BreadcrumbChild extends Component<BreadcrumbChildProps, BreadcrumbChildState> {
  private node: HTMLLIElement | null;
  private dropdownRefs: HTMLElement[];
  private dropdownContainerRef: HTMLDivElement | null;

  constructor(props, context) {
    super(props, context);
    this.node = null;
    this.dropdownRefs = [];
    this.dropdownContainerRef = null;
    this.state = {
      searchValue: "",
      searchResults: [],
      cursor: 0
    }
  }

  componentDidMount() {
    this.setState({ searchResults: this.props.dropdownItems });
    document.addEventListener('mousedown', this.outsideClick);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ searchResults: nextProps.dropdownItems });
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.outsideClick);
  }

  setNodeRef = (el: HTMLLIElement) => {
    this.node = el;
  };

  setDropdownRefs = (el, i: number) => {
    this.dropdownRefs[i] = el
  };

  setDropdownContainerRef = (el: HTMLDivElement) => {
    this.dropdownContainerRef = el;
  };

  arrowClick = (e) => {
    e.preventDefault();
    this.props.onClick();
  }

  searchChange = (e) => {
    const searchValue = e.target.value;
    if (searchValue.trim() === "") {
      this.setState({ searchValue, searchResults: this.props.dropdownItems, cursor: 0 });
    } else {
      const searchResults = this.props.dropdownItems.filter((o) => {
        return o.label.toLowerCase().indexOf(searchValue.trim().toLowerCase()) > -1;
      });
      this.setState({ searchValue, searchResults, cursor: 0 });
    }
  }

  outsideClick = (e) => {
    if (this.props.open && !(this.node && this.node.contains(e.target))) {
      this.props.outsideClick();
    }
  }

  keyDown = (e) => {
    if (e.keyCode === 38 && this.state.cursor > 0) {//arrowUp
      this.setState(prevState => ({
        cursor: prevState.cursor - 1
      }), this.arrowUpPress);
    } else if (e.keyCode === 40 && this.state.cursor < this.state.searchResults.length - 1) {//arrow down
      this.setState(prevState => ({
        cursor: prevState.cursor + 1
      }), this.arrowDownPress);
    } else if (e.keyCode == 13 && this.state.cursor > -1) { //enter
      const selected = this.state.searchResults[this.state.cursor];
      const href = this.getDropdownItemHref(selected);
      window.location.href = href;
    }
  }

  arrowUpPress() {
    const container = this.dropdownContainerRef;
    const selected = this.dropdownRefs[this.state.cursor];

    if (selected) {
      const containerScrollTop = container.scrollTop || 0;
      const selectedOffsetTop = selected.offsetTop;
      const scrollDiff = selectedOffsetTop - containerScrollTop;

      if (scrollDiff < 0) {
        container.scrollTop -= 30;
      }

      if (containerScrollTop < 270) {
        container.scrollTop = 0;
      }
    }
  }

  arrowDownPress() {
    const container = this.dropdownContainerRef;
    const selected = this.dropdownRefs[this.state.cursor];

    if (selected) {
      const containerScrollTop = container.scrollTop || 0;
      const selectedOffsetTop = selected.offsetTop;
      const scrollDiff = selectedOffsetTop - containerScrollTop;
      if (scrollDiff > 270) {
        container.scrollTop += 30;
      }
    }
  }

  getDropdownItemHref(dropdownItem: BreadcrumbDropdownItem): string {
    return `/${this.props.page}/${dropdownItem.type}/${dropdownItem.id}`;
  }

  getTypeLabel(type: BreadcrumbType): string {
    switch (type) {
      case "organization": return "Organizations";
      case "agency": return "Agencies";
      case "advertiser": return "Advertisers";
      case "campaigngroup": return "Campaign groups";
      case "campaign": return "Campaigns";
      default: return "";
    }
  }

  render() {
    const arrowIconClass = this.props.open ? "fa fa-caret-square-o-up" : "fa fa-caret-square-o-down";
    const showArrow: boolean = this.props.item.parent !== -1 || (this.props.user.isRootAdmin && this.props.item.type !== undefined);
    return <li className="breadcrumb-item" ref={this.setNodeRef}>
      <BreadcrumbLabel item={this.props.item} user={this.props.user} onClick={this.arrowClick} />
      {this.props.item.parent !== undefined &&
        <Fragment>
          {showArrow &&
            <a className="ml-1" href="" onClick={this.arrowClick}><i className={arrowIconClass}></i></a>
          }
          {this.props.open &&
            <div className="breadcrumb-dropdown card" ref={this.setDropdownContainerRef}>
              <Loader visible={this.props.loading} />
              {!this.props.loading && <Fragment>
                <div className="breadcrumb-search-container">
                  <input autoFocus type="text" placeholder="Search..." value={this.state.searchValue} onChange={this.searchChange} onKeyDown={this.keyDown} />
                </div>
                <div className="breadcrumb-type">{this.getTypeLabel(this.props.item.type)}</div>
                {
                  this.state.searchResults.length > 0 && this.state.searchResults.map((item, i) => <a
                    key={i}
                    ref={(el) => { this.setDropdownRefs(el, i) }}
                    className={this.state.cursor === i ? 'active' : null}
                    href=""
                    onClick={(e) => { e.preventDefault(); this.props.itemClick(this.getDropdownItemHref(item)) }}
                    onMouseEnter={() => this.setState({ cursor: i })}>
                    {item.label}
                  </a>)
                }
                {this.state.searchResults.length === 0 &&
                  <div className="ml-1">No results found</div>
                }
              </Fragment>}
            </div>
          }
        </Fragment>
      }
    </li>;
  }
}