package io.invertase.admob;

import static io.invertase.admob.ReactNativeAdMobCommon.buildAdRequest;
import static io.invertase.admob.ReactNativeAdMobCommon.getCodeAndMessageFromAdErrorCode;
import static io.invertase.admob.ReactNativeAdMobCommon.sendAdEvent;
import static io.invertase.admob.ReactNativeAdMobEvent.AD_CLOSED;
import static io.invertase.admob.ReactNativeAdMobEvent.AD_ERROR;
import static io.invertase.admob.ReactNativeAdMobEvent.AD_OPENED;
import static io.invertase.admob.ReactNativeAdMobEvent.AD_REWARDED_EARNED_REWARD;
import static io.invertase.admob.ReactNativeAdMobEvent.AD_REWARDED_LOADED;

import android.app.Activity;
import android.util.SparseArray;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.ads.rewarded.RewardItem;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdCallback;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import com.google.android.gms.ads.rewarded.ServerSideVerificationOptions;
import io.invertase.admob.common.ReactNativeModule;

public class ReactNativeAdMobRewardedModule extends ReactNativeModule {
  private static final String SERVICE = "AdMobRewarded";
  private static SparseArray<RewardedAd> rewardedAdArray = new SparseArray<>();

  public ReactNativeAdMobRewardedModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE);
  }

  private void sendRewardedEvent(
      String type,
      int requestId,
      String adUnitId,
      @Nullable WritableMap error,
      @Nullable WritableMap data) {
    sendAdEvent(ReactNativeAdMobEvent.EVENT_REWARDED, requestId, type, adUnitId, error, data);
  }

  @ReactMethod
  public void rewardedLoad(int requestId, String adUnitId, ReadableMap adRequestOptions) {
    Activity activity = getCurrentActivity();
    if (activity == null) {
      WritableMap error = Arguments.createMap();
      error.putString("code", "null-activity");
      error.putString(
          "message", "Rewarded ad attempted to load but the current Activity was null.");
      sendRewardedEvent(AD_ERROR, requestId, adUnitId, error, null);
      return;
    }
    activity.runOnUiThread(
        () -> {
          RewardedAd rewardedAd = new RewardedAd(activity, adUnitId);

          RewardedAdLoadCallback adLoadCallback =
              new RewardedAdLoadCallback() {
                @Override
                public void onRewardedAdLoaded() {
                  RewardItem rewardItem = rewardedAd.getRewardItem();
                  WritableMap data = Arguments.createMap();
                  data.putString("type", rewardItem.getType());
                  data.putInt("amount", rewardItem.getAmount());
                  sendRewardedEvent(AD_REWARDED_LOADED, requestId, adUnitId, null, data);
                }

                @Override
                public void onRewardedAdFailedToLoad(int errorCode) {
                  WritableMap error = Arguments.createMap();
                  String[] codeAndMessage = getCodeAndMessageFromAdErrorCode(errorCode);
                  error.putString("code", codeAndMessage[0]);
                  error.putString("message", codeAndMessage[1]);
                  sendRewardedEvent(AD_ERROR, requestId, adUnitId, error, null);
                }
              };

          if (adRequestOptions.hasKey("serverSideVerificationOptions")) {
            ReadableMap serverSideVerificationOptions =
                adRequestOptions.getMap("serverSideVerificationOptions");

            if (serverSideVerificationOptions != null) {
              ServerSideVerificationOptions.Builder options =
                  new ServerSideVerificationOptions.Builder();

              if (serverSideVerificationOptions.hasKey("userId")) {
                options.setUserId(serverSideVerificationOptions.getString("userId"));
              }

              if (serverSideVerificationOptions.hasKey("customData")) {
                options.setCustomData(serverSideVerificationOptions.getString("customData"));
              }

              rewardedAd.setServerSideVerificationOptions(options.build());
            }
          }

          rewardedAd.loadAd(buildAdRequest(adRequestOptions), adLoadCallback);
          rewardedAdArray.put(requestId, rewardedAd);
        });
  }

  @ReactMethod
  public void rewardedShow(
      int requestId, String adUnitId, ReadableMap showOptions, Promise promise) {
    if (getCurrentActivity() == null) {
      rejectPromiseWithCodeAndMessage(
          promise,
          "null-activity",
          "Rewarded ad attempted to show but the current Activity was null.");
      return;
    }
    getCurrentActivity()
        .runOnUiThread(
            () -> {
              RewardedAd rewardedAd = rewardedAdArray.get(requestId);

              boolean immersiveModeEnabled = false;
              if (showOptions.hasKey("immersiveModeEnabled")) {
                immersiveModeEnabled = showOptions.getBoolean("immersiveModeEnabled");
              }

              RewardedAdCallback adCallback =
                  new RewardedAdCallback() {
                    @Override
                    public void onRewardedAdOpened() {
                      sendRewardedEvent(AD_OPENED, requestId, adUnitId, null, null);
                    }

                    @Override
                    public void onRewardedAdClosed() {
                      sendRewardedEvent(AD_CLOSED, requestId, adUnitId, null, null);
                    }

                    @Override
                    public void onUserEarnedReward(@NonNull RewardItem reward) {
                      WritableMap data = Arguments.createMap();
                      data.putString("type", reward.getType());
                      data.putInt("amount", reward.getAmount());
                      sendRewardedEvent(AD_REWARDED_EARNED_REWARD, requestId, adUnitId, null, data);
                    }

                    @Override
                    public void onRewardedAdFailedToShow(int errorCode) {
                      WritableMap error = Arguments.createMap();
                      String[] codeAndMessage = getCodeAndMessageFromAdErrorCode(errorCode);
                      error.putString("code", codeAndMessage[0]);
                      error.putString("message", codeAndMessage[1]);
                      sendRewardedEvent(AD_ERROR, requestId, adUnitId, error, null);
                    }
                  };

              rewardedAd.show(getCurrentActivity(), adCallback, immersiveModeEnabled);
              promise.resolve(null);
            });
  }
}
