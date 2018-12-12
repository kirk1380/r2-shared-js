// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

// import { JsonStringConverter } from "@r2-utils-js/_utils/ta-json-string-converter";

import { LCP } from "@r2-lcp-js/parser/epub/lcp";
import { IZip } from "@r2-utils-js/_utils/zip/zip";
// https://github.com/edcarroll/ta-json
import {
    // JsonConverter,
    JsonElementType,
    JsonObject,
    JsonProperty,
    OnDeserialized,
} from "ta-json-x";

import { IInternal } from "./internal";
import { Metadata } from "./metadata";
import { Link } from "./publication-link";

// import { IPublicationCollection } from "./publication-collection";

@JsonObject()
export class Publication {

    // @JsonConverter(JsonStringConverter)
    @JsonProperty("@context")
    @JsonElementType(String)
    public Context!: string[];

    @JsonProperty("metadata")
    public Metadata!: Metadata;

    @JsonProperty("links")
    @JsonElementType(Link)
    public Links!: Link[];

    @JsonProperty("readingOrder")
    @JsonElementType(Link)
    public Spine!: Link[];

    @JsonProperty("resources")
    @JsonElementType(Link)
    public Resources!: Link[];

    @JsonProperty("toc")
    @JsonElementType(Link)
    public TOC!: Link[];

    @JsonProperty("page-list")
    @JsonElementType(Link)
    public PageList!: Link[];

    @JsonProperty("landmarks")
    @JsonElementType(Link)
    public Landmarks!: Link[];

    @JsonProperty("loi")
    @JsonElementType(Link)
    public LOI!: Link[];

    @JsonProperty("loa")
    @JsonElementType(Link)
    public LOA!: Link[];

    @JsonProperty("lov")
    @JsonElementType(Link)
    public LOV!: Link[];

    @JsonProperty("lot")
    @JsonElementType(Link)
    public LOT!: Link[];

    // // OPDS2
    // @JsonProperty("images")
    // @JsonElementType(Link)
    // public Images!: Link[];

    // public OtherLinks: Link[];
    // public OtherCollections: IPublicationCollection[];

    public LCP: LCP | undefined;

    private Internal: IInternal[] | undefined;

    public freeDestroy() {
        console.log("freeDestroy: Publication");
        if (this.Internal) {
            const zipInternal = this.findFromInternal("zip");
            if (zipInternal) {
                const zip = zipInternal.Value as IZip;
                zip.freeDestroy();
            }
        }
    }

    public findFromInternal(key: string): IInternal | undefined {
        if (this.Internal) {
            const found = this.Internal.find((internal) => {
                return internal.Name === key;
            });
            if (found) {
                return found;
            }
        }
        return undefined;
    }

    public AddToInternal(key: string, value: any) {
        const existing = this.findFromInternal(key);
        if (existing) {
            existing.Value = value;
        } else {
            if (!this.Internal) {
                this.Internal = [];
            }

            const internal: IInternal = { Name: key, Value: value };
            this.Internal.push(internal);
        }
    }

    // public findLinKByHref(href: string): Link | undefined {
    //     if (this.Spine) {
    //         const ll = this.Spine.find((link) => {
    //             if (link.Href && href.indexOf(link.Href) >= 0) {
    //                 return true;
    //             }
    //             return false;
    //         });
    //         if (ll) {
    //             return ll;
    //         }
    //     }
    //     return undefined;
    // }

    public GetCover(): Link | undefined {
        return this.searchLinkByRel("cover");
    }

    public GetNavDoc(): Link | undefined {
        return this.searchLinkByRel("contents");
    }

    public searchLinkByRel(rel: string): Link | undefined {
        if (this.Resources) {
            const ll = this.Resources.find((link) => {
                return link.HasRel(rel);
            });
            if (ll) {
                return ll;
            }
        }

        if (this.Spine) {
            const ll = this.Spine.find((link) => {
                return link.HasRel(rel);
            });
            if (ll) {
                return ll;
            }
        }

        if (this.Links) {
            const ll = this.Links.find((link) => {
                return link.HasRel(rel);
            });
            if (ll) {
                return ll;
            }
        }

        return undefined;
    }

    public AddLink(typeLink: string, rel: string[], url: string, templated: boolean | undefined) {
        const link = new Link();
        link.AddRels(rel);
        link.Href = url;
        link.TypeLink = typeLink;

        if (typeof templated !== "undefined") {
            link.Templated = templated;
        }

        if (!this.Links) {
            this.Links = [];
        }
        this.Links.push(link);
    }

    @OnDeserialized()
    // tslint:disable-next-line:no-unused-variable
    // @ts-ignore: TS6133 (is declared but its value is never read.)
    private _OnDeserialized() {
        if (!this.Metadata) {
            console.log("Publication.Metadata is not set!");
        }
        if (!this.Links) {
            console.log("Publication.Links is not set!");
        }
    }
}
