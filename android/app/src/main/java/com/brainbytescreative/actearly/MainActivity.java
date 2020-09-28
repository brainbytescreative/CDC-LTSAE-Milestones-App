package com.brainbytescreative.actearly;

import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.google.android.gms.security.ProviderInstaller;

public class MainActivity extends ReactActivity implements ProviderInstaller.ProviderInstallListener {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "brainbytescreative.actearly";
  }

  //Update the security provider when the activity is created.
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    ProviderInstaller.installIfNeededAsync(this, this);
  }

  /**
   * This method is only called if the provider is successfully updated
   * (or is already up-to-date).
   */
  @Override
  public void onProviderInstalled() {
      // Provider is up-to-date, app can make secure network calls.
  }

  @Override
  public void onProviderInstallFailed(int i, Intent intent) {

  }
}
