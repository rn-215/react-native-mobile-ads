/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */

export enum BannerAdSize {
  /**
   * Mobile Marketing Association (MMA) banner ad size (320x50 density-independent pixels).
   */
  BANNER = 'BANNER',

  /**
   * Interactive Advertising Bureau (IAB) full banner ad size (468x60 density-independent pixels).
   */
  FULL_BANNER = 'FULL_BANNER',

  /**
   * Large banner ad size (320x100 density-independent pixels).
   */
  LARGE_BANNER = 'LARGE_BANNER',

  /**
   * Interactive Advertising Bureau (IAB) leaderboard ad size (728x90 density-independent pixels).
   */
  LEADERBOARD = 'LEADERBOARD',

  /**
   * Interactive Advertising Bureau (IAB) medium rectangle ad size (300x250 density-independent pixels).
   */
  MEDIUM_RECTANGLE = 'MEDIUM_RECTANGLE',

  /**
   * A (next generation) dynamically sized banner that is full-width and auto-height.
   */
  ADAPTIVE_BANNER = 'ADAPTIVE_BANNER',

  /**
   * A dynamically sized banner that matches its parent's width and expands/contracts its height to match the ad's content after loading completes.
   */
  FLUID = 'FLUID',

  /**
   * IAB wide skyscraper ad size (160x600 density-independent pixels). This size is currently not supported by the Google Mobile Ads network; this is intended for mediation ad networks only.
   */
  WIDE_SKYSCRAPER = 'WIDE_SKYSCRAPER',
}
