package com.brainbytescreative.actearly.generated;

import java.util.Arrays;
import java.util.List;
import org.unimodules.core.interfaces.Package;

public class BasePackageList {
  public List<Package> getPackageList() {
    return Arrays.<Package>asList(
        new expo.modules.application.ApplicationPackage(),
        new expo.modules.mailcomposer.MailComposerPackage(),
        new expo.modules.notifications.NotificationsPackage()
    );
  }
}
